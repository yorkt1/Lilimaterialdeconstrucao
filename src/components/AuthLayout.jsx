import { Link } from 'react-router-dom';

export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <Link to="/" className="flex justify-center mb-6">
          <img
            src="https://res.cloudinary.com/dqewxdbfx/image/upload/v1778761158/Design_sem_nome_8_zt8w8p.png"
            alt="Lili Materiais"
            className="h-12 w-auto object-contain"
          />
        </Link>

        {Icon && (
          <div className="mx-auto h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        )}
        <h2 className="mt-4 text-center text-2xl font-extrabold text-gray-900 font-heading uppercase tracking-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-2 text-center text-sm text-gray-500">
            {subtitle}
          </p>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-sm sm:rounded-lg sm:px-10 border border-gray-200">
          {children}
        </div>
        {footer && (
          <p className="mt-6 text-center text-sm text-gray-600">
            {footer}
          </p>
        )}
      </div>
    </div>
  );
}
