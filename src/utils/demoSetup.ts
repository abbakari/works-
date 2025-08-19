import { supabase } from '../lib/supabase';

export const createDemoUser = async () => {
  try {
    const demoEmail = 'demo@stmbudget.com';
    const demoPassword = 'demo123456';
    const demoName = 'Demo User';

    console.log('Attempting to create demo user...');

    // First, try to sign up the demo user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: demoEmail,
      password: demoPassword,
      options: {
        data: {
          full_name: demoName,
          role: 'admin',
          department: 'Sales'
        }
      }
    });

    console.log('Signup response:', { signUpData, signUpError });

    if (signUpError) {
      if (signUpError.message.includes('User already registered')) {
        console.log('User already exists, will try to sign in');
      } else {
        console.error('Signup error:', signUpError);
        throw signUpError;
      }
    } else {
      console.log('User created successfully!');
    }

    // Try to sign in regardless of signup result
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: demoEmail,
      password: demoPassword,
    });

    console.log('Sign in response:', { signInData, signInError });

    if (signInError) {
      console.error('Sign in error:', signInError);
      throw signInError;
    }

    console.log('Demo user signed in successfully!');
    return { email: demoEmail, password: demoPassword, name: demoName };
  } catch (error) {
    console.error('Error in createDemoUser:', error);
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
