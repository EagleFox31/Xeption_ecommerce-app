import AuthLayout from "@/components/auth/AuthLayout";
import RegistrationForm from "@/components/auth/RegistrationForm";

const RegisterPage = () => {
  return (
    <AuthLayout title="Créer un compte" subtitle="Rejoignez Xeption Network">
      <RegistrationForm />
    </AuthLayout>
  );
};

export default RegisterPage;
