import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Psychologist, Client, AppView, TestResult, SubscriptionPlan } from '../types';
import { generateAccessCode } from '../utils/storage';
import { supabase } from '../lib/supabase';

const ADMIN_EMAIL = 'dr.lkhagvaa@gmail.com';

interface AppContextValue {
  psychologist: Psychologist | null;
  clients: Client[];
  view: AppView;
  activeClient: Client | null;
  loading: boolean;
  isRecovery: boolean;

  registerPsychologist: (name: string, email: string, password: string) => Promise<boolean>;
  loginPsychologist: (email: string, password: string) => Promise<boolean>;
  logoutPsychologist: () => void;
  sendPasswordReset: (email: string) => Promise<{ ok: boolean; name?: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  setNewPassword: (newPassword: string) => Promise<boolean>;
  beginRecovery: (email: string) => void;

  navigate: (page: AppView['page'], extra?: Partial<AppView>) => void;

  addClient: (data: Omit<Client, 'id' | 'psychologistId' | 'accessCode' | 'assignedTests' | 'completedTests' | 'createdAt'> & { accessCode?: string }) => Promise<string | null>;
  updateClient: (id: string, data: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  getClientByCode: (code: string) => Promise<Client | null>;

  assignTests: (clientId: string, testIds: string[]) => void;
  saveTestResult: (clientId: string, result: TestResult) => Promise<string | null>;
  regenerateCode: (clientId: string) => void;
  refreshClients: () => Promise<void>;

  selectPlan: (plan: SubscriptionPlan) => Promise<void>;
  activateSubscription: (psychId: string, plan: SubscriptionPlan) => Promise<void>;
  getPendingPsychologists: () => Promise<Psychologist[]>;
  isAdmin: boolean;
}

const AppContext = createContext<AppContextValue | null>(null);

function mapResult(row: Record<string, unknown>): TestResult {
  return {
    testId: row.test_id as string,
    answers: (row.answers as TestResult['answers']) ?? [],
    subscaleScores: (row.subscale_scores as TestResult['subscaleScores']) ?? {},
    totalScore: (row.total_score as number) ?? 0,
    interpretation: (row.interpretation as string) ?? '',
    severity: (row.severity as TestResult['severity']) ?? 'minimal',
    completedAt: row.completed_at as string,
  };
}

function mapPsychologist(row: Record<string, unknown>): Psychologist {
  return {
    id: row.id as string,
    name: row.name as string,
    email: row.email as string,
    createdAt: row.created_at as string,
    subscriptionStatus: (row.subscription_status as Psychologist['subscriptionStatus']) ?? 'pending',
    subscriptionPlan: (row.subscription_plan as Psychologist['subscriptionPlan']) ?? undefined,
    subscriptionExpiresAt: (row.subscription_expires_at as string) ?? undefined,
  };
}

function mapClient(row: Record<string, unknown>, resultRows: Record<string, unknown>[]): Client {
  return {
    id: row.id as string,
    psychologistId: row.psychologist_id as string,
    name: row.name as string,
    age: row.age as number,
    gender: row.gender as Client['gender'],
    email: (row.email as string) || undefined,
    phone: (row.phone as string) || undefined,
    notes: (row.notes as string) || undefined,
    accessCode: row.access_code as string,
    assignedTests: (row.assigned_tests as string[]) ?? [],
    completedTests: resultRows.filter((r) => r.client_id === row.id).map(mapResult),
    createdAt: row.created_at as string,
  };
}

function isSubscriptionActive(psych: Psychologist): boolean {
  if (psych.email === ADMIN_EMAIL) return true;
  if (psych.subscriptionStatus !== 'active') return false;
  if (!psych.subscriptionExpiresAt) return false;
  return new Date(psych.subscriptionExpiresAt) > new Date();
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [psychologist, setPsychologist] = useState<Psychologist | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [view, setView] = useState<AppView>({ page: 'home' });
  const [loading, setLoading] = useState(true);
  const [isRecovery, setIsRecovery] = useState(false);

  const activeClient = clients.find((c) => c.id === view.selectedClientId) ?? null;

  function navigate(page: AppView['page'], extra?: Partial<AppView>) {
    setView({ page, ...extra });
  }

  async function loadClientData(psychologistId: string) {
    const { data: clientRows, error: clientErr } = await supabase
      .from('clients')
      .select('*')
      .eq('psychologist_id', psychologistId)
      .order('created_at', { ascending: false });

    if (clientErr) {
      console.error('clients fetch error:', clientErr.message);
      return;
    }

    if (!clientRows || clientRows.length === 0) {
      setClients([]);
      return;
    }

    const clientIds = clientRows.map((c) => c.id as string);
    const { data: resultRows, error: resultErr } = await supabase
      .from('test_results')
      .select('*')
      .in('client_id', clientIds);

    if (resultErr) {
      console.error('test_results fetch error:', resultErr.message);
    }

    setClients(clientRows.map((row) => mapClient(row, resultRows ?? [])));
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (error || !session?.user) {
        setLoading(false);
        return;
      }
      const { data: psychRow } = await supabase
        .from('psychologists')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (psychRow) {
        const psych = mapPsychologist(psychRow);
        if (!psych.email && session.user.email) psych.email = session.user.email;
        setPsychologist(psych);
        if (isSubscriptionActive(psych)) {
          await loadClientData(psych.id);
        }
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecovery(false);
        navigate('psych-reset-password');
      }
      if (event === 'SIGNED_OUT') {
        setPsychologist(null);
        setClients([]);
        setView({ page: 'home' });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function registerPsychologist(name: string, email: string, password: string): Promise<boolean> {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error || !data.user) return false;

    await supabase.from('psychologists').insert({
      id: data.user.id, name, email, subscription_status: 'pending',
    });

    setPsychologist({
      id: data.user.id, name, email, createdAt: new Date().toISOString(),
      subscriptionStatus: 'pending',
    });
    setClients([]);
    return true;
  }

  async function loginPsychologist(email: string, password: string): Promise<boolean> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) return false;

    const { data: psychRow } = await supabase
      .from('psychologists')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (!psychRow) return false;

    const psych = mapPsychologist(psychRow);
    if (!psych.email && data.user.email) psych.email = data.user.email;
    setPsychologist(psych);
    if (isSubscriptionActive(psych)) {
      await loadClientData(psych.id);
    }
    return true;
  }

  function logoutPsychologist() {
    supabase.auth.signOut();
    setPsychologist(null);
    setClients([]);
    navigate('home');
  }

  async function sendPasswordReset(email: string): Promise<{ ok: boolean; name?: string }> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://mindspringmongolia.xyz',
    });
    return { ok: !error };
  }

  function beginRecovery(_email: string) {
    setIsRecovery(true);
    navigate('psych-reset-password');
  }

  async function changePassword(currentPassword: string, newPassword: string): Promise<boolean> {
    if (!psychologist) return false;
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: psychologist.email,
      password: currentPassword,
    });
    if (verifyError) return false;
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return !error;
  }

  async function setNewPassword(newPassword: string): Promise<boolean> {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return false;
    setIsRecovery(false);
    supabase.auth.signOut();
    navigate('psych-login');
    return true;
  }

  async function addClient(data: Omit<Client, 'id' | 'psychologistId' | 'accessCode' | 'assignedTests' | 'completedTests' | 'createdAt'> & { accessCode?: string }): Promise<string | null> {
    if (!psychologist) return 'Нэвтрээгүй байна.';
    const id = crypto.randomUUID();
    const code = data.accessCode ?? generateAccessCode();
    const client: Client = {
      id,
      psychologistId: psychologist.id,
      accessCode: code,
      assignedTests: [],
      completedTests: [],
      createdAt: new Date().toISOString(),
      ...data,
    };

    const { error } = await supabase.from('clients').insert({
      id,
      psychologist_id: psychologist.id,
      name: data.name,
      age: data.age,
      gender: data.gender,
      email: data.email || null,
      phone: data.phone || null,
      notes: data.notes || null,
      access_code: code,
      assigned_tests: [],
    });

    if (error) return error.message;
    setClients((prev) => [client, ...prev]);
    return null;
  }

  function updateClient(id: string, data: Partial<Client>) {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));

    const dbUpdate: Record<string, unknown> = {};
    if (data.name !== undefined) dbUpdate.name = data.name;
    if (data.age !== undefined) dbUpdate.age = data.age;
    if (data.gender !== undefined) dbUpdate.gender = data.gender;
    if (data.email !== undefined) dbUpdate.email = data.email || null;
    if (data.phone !== undefined) dbUpdate.phone = data.phone || null;
    if (data.notes !== undefined) dbUpdate.notes = data.notes || null;
    if (data.accessCode !== undefined) dbUpdate.access_code = data.accessCode;
    if (data.assignedTests !== undefined) dbUpdate.assigned_tests = data.assignedTests;

    if (Object.keys(dbUpdate).length > 0) {
      supabase.from('clients').update(dbUpdate).eq('id', id).then(() => {});
    }
  }

  function deleteClient(id: string) {
    setClients((prev) => prev.filter((c) => c.id !== id));
    supabase.from('clients').delete().eq('id', id).then(() => {});
  }

  async function getClientByCode(code: string): Promise<Client | null> {
    const { data: clientRow } = await supabase
      .from('clients')
      .select('*')
      .eq('access_code', code.toUpperCase())
      .single();

    if (!clientRow) return null;

    const { data: resultRows } = await supabase
      .from('test_results')
      .select('*')
      .eq('client_id', clientRow.id);

    const client = mapClient(clientRow, resultRows ?? []);

    setClients((prev) => {
      if (prev.some((c) => c.id === client.id)) {
        return prev.map((c) => (c.id === client.id ? client : c));
      }
      return [...prev, client];
    });

    return client;
  }

  function assignTests(clientId: string, testIds: string[]) {
    updateClient(clientId, { assignedTests: testIds });
  }

  async function saveTestResult(clientId: string, result: TestResult): Promise<string | null> {
    const { error } = await supabase.from('test_results').upsert(
      {
        client_id: clientId,
        test_id: result.testId,
        answers: result.answers,
        subscale_scores: result.subscaleScores,
        total_score: result.totalScore,
        interpretation: result.interpretation,
        severity: result.severity,
        completed_at: result.completedAt,
      },
      { onConflict: 'client_id,test_id' }
    );

    if (error) return error.message;

    setClients((prev) =>
      prev.map((c) => {
        if (c.id !== clientId) return c;
        return {
          ...c,
          completedTests: [
            ...c.completedTests.filter((r) => r.testId !== result.testId),
            result,
          ],
        };
      })
    );
    return null;
  }

  function regenerateCode(clientId: string) {
    const code = generateAccessCode();
    updateClient(clientId, { accessCode: code });
  }

  async function refreshClients() {
    if (psychologist) await loadClientData(psychologist.id);
  }

  async function selectPlan(plan: SubscriptionPlan) {
    if (!psychologist) return;
    await supabase.from('psychologists').update({ subscription_plan: plan }).eq('id', psychologist.id);
    setPsychologist((p) => p ? { ...p, subscriptionPlan: plan } : p);
  }

  async function activateSubscription(psychId: string, plan: SubscriptionPlan) {
    const now = new Date();
    const expires = new Date(now);
    if (plan === 'monthly') expires.setDate(expires.getDate() + 30);
    else expires.setFullYear(expires.getFullYear() + 1);

    await supabase.from('psychologists').update({
      subscription_status: 'active',
      subscription_plan: plan,
      subscription_expires_at: expires.toISOString(),
    }).eq('id', psychId);
  }

  async function getPendingPsychologists(): Promise<Psychologist[]> {
    const { data, error } = await supabase
      .from('psychologists')
      .select('*')
      .neq('email', ADMIN_EMAIL)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapPsychologist);
  }

  const isAdmin = psychologist?.email === ADMIN_EMAIL;

  return (
    <AppContext.Provider
      value={{
        psychologist,
        clients,
        view,
        activeClient,
        loading,
        isRecovery,
        registerPsychologist,
        loginPsychologist,
        logoutPsychologist,
        sendPasswordReset,
        changePassword,
        setNewPassword,
        beginRecovery,
        navigate,
        addClient,
        updateClient,
        deleteClient,
        getClientByCode,
        assignTests,
        saveTestResult,
        regenerateCode, refreshClients,
        selectPlan, activateSubscription, getPendingPsychologists, isAdmin,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
