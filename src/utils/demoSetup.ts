import { supabase } from '../lib/supabase';

export const createDemoUser = async () => {
  try {
    const demoEmail = 'demo@stmbudget.com';
    const demoPassword = 'demo123456';
    const demoName = 'Demo User';

    // First, try to sign up the demo user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: demoEmail,
      password: demoPassword,
      options: {
        data: {
          full_name: demoName,
          role: 'admin',
        }
      }
    });

    if (signUpError && !signUpError.message.includes('User already registered')) {
      throw signUpError;
    }

    // If signup was successful or user exists, try to sign in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: demoEmail,
      password: demoPassword,
    });

    if (signInError) {
      throw signInError;
    }

    console.log('Demo user created/signed in successfully:', signInData);
    return { email: demoEmail, password: demoPassword, name: demoName };
  } catch (error) {
    console.error('Error creating demo user:', error);
    throw error;
  }
};

export const getDemoCredentials = () => {
  return {
    email: 'demo@stmbudget.com',
    password: 'demo123456',
    name: 'Demo User'
  };
};

export const createAdminUser = async (email: string, password: string, fullName: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: 'admin',
        }
      }
    });

    if (error) {
      throw error;
    }

    console.log('Admin user created successfully:', data);
    return data;
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw error;
  }
};
