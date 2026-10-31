import React from 'react';
import { AuthLayout } from '../../layouts/AuthLayout';
import { SignupForm } from '../../components/auth/SignupForm';

export const SignupPage: React.FC = () => {
  return (
    <AuthLayout>
      <SignupForm />
    </AuthLayout>
  );
};
