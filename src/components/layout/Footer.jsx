import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Clock, MapPin, MessageCircle } from 'lucide-react';

const departments = [
  { key: 'materiais_construcao', label: 'Materiais de Construção' },
  { key: 'pisos_revestimentos',  label: 'Pisos e Revestimentos' },
  { key: 'tintas_acessorios',    label: 'Tintas e Acessórios' },
  { key: 'ferramentas',          label: 'Ferramentas' },
  { key: 'hidraulica',           label: 'Hidráulica' },
  { key: 'eletrica',             label: 'Elétrica' },
  { key: 'iluminacao',           label: 'Iluminação' },
  { key: 'banheiro',             label: 'Banheiro' },
  { key: 'portas_janelas',       label: 'Portas e Janelas' },
];

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Marca */}
          <div className="space-y-4">
            <img
              src="https://res.cloudinary.com/dqewxdbfx/image/upload/v1778761158/Design_sem_nome_8_zt8w8p.png"
              alt="Lili Materiais"
              className="h-12 w-auto object-contain brightness-0 invert"
            />
            <p className="text-sm text-gray-400 leading-relaxed">
              Materiais de construção e acabamento com qualidade e preço justo para sua obra em Bonfinópolis de Minas e região.
            </p>
            <div className="flex gap-3 pt-1">
              <a href="https://www.instagram.com/lilimateriaisdeconstrucao/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                className="w-9 h-9 bg-gray-800 hover:bg-pink-600 rounded-full flex items-center justify-center transition-colors">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="https://www.facebook.com/profile.php?id=100071014281944" target="_blank" rel="noopener noreferrer" aria-label="Facebook"
                className="w-9 h-9 bg-gray-800 hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="https://wa.me/5538999144595" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"
                className="w-9 h-9 bg-gray-800 hover:bg-green-600 rounded-full flex items-center justify-center transition-colors">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </a>
            </div>
          </div>

          {/* Departamentos */}
          <div>
            <h3 className="font-heading font-bold text-xs uppercase tracking-[0.2em] mb-5 text-white">Departamentos</h3>
            <nav className="space-y-2.5">
              {departments.map(d => (
                <Link key={d.key} to={`/catalogo?categoria=${d.key}`} className="block text-sm text-gray-400 hover:text-primary transition-colors">
                  {d.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Institucional */}
          <div>
            <h3 className="font-heading font-bold text-xs uppercase tracking-[0.2em] mb-5 text-white">Institucional</h3>
            <nav className="space-y-2.5">
              <Link to="/lojas" className="block text-sm text-gray-400 hover:text-primary transition-colors">Nossas Lojas</Link>
              <a href="#" className="block text-sm text-gray-400 hover:text-primary transition-colors">Política de Privacidade</a>
              <a href="#" className="block text-sm text-gray-400 hover:text-primary transition-colors">Trocas e Devoluções</a>
              <Link to="/admin" className="block text-sm text-gray-600 hover:text-gray-400 transition-colors mt-4">
                Painel Administrativo
              </Link>
            </nav>
          </div>

          {/* Atendimento */}
          <div>
            <h3 className="font-heading font-bold text-xs uppercase tracking-[0.2em] mb-5 text-white">Atendimento</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 text-sm text-gray-400">
                <Phone className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <span>(38) 99914-4595</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-gray-400">
                <MessageCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                <a href="https://wa.me/5538999144595" target="_blank" rel="noopener noreferrer"
                  className="text-green-400 hover:text-green-300 transition-colors">
                  (38) 99914-4595 — WhatsApp
                </a>
              </div>
              <div className="flex items-start gap-3 text-sm text-gray-400">
                <MessageCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                <a href="https://wa.me/5538999571663" target="_blank" rel="noopener noreferrer"
                  className="text-green-400 hover:text-green-300 transition-colors">
                  (38) 99957-1663 — WhatsApp
                </a>
              </div>
              <div className="flex items-start gap-3 text-sm text-gray-400">
                <Clock className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <span>Seg a Sex: 07h–17h30<br />Sáb: 07h–12h<br />Dom: Fechado</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-gray-400">
                <MapPin className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <span>Av. Argemiro Barbosa da Silva, 640<br />Centro — Bonfinópolis de Minas/MG<br />CEP 38650-000</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Rodapé inferior */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-gray-600">
          <div className="text-center md:text-left space-y-0.5">
            <p>© 2026 Lili Materiais de Construção. Todos os direitos reservados.</p>
            <p>LILI MATERIAIS CONSTRUÇÃO LTDA - EPP — CNPJ 00.982.370/0001-71</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <span className="mr-1">Pagamentos:</span>
            {['Pix', 'Dinheiro', 'Cartão', 'Boleto'].map(m => (
              <span key={m} className="font-bold bg-gray-800 text-gray-400 px-2.5 py-1 rounded-sm">{m}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
