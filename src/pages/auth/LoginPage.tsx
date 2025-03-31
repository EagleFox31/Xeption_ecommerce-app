import AuthLayout from "@/components/auth/AuthLayout";
import LoginForm from "@/components/auth/LoginForm";

const LoginPage = () => {
  return (
    <AuthLayout
      title="Connexion"
      subtitle="Connectez-vous à votre compte Xeption Network"
    >
      <LoginForm />
    </AuthLayout>
  );
};

export default LoginPage;
