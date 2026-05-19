import React from 'react';
import { MapPin, Phone, Clock, MessageCircle } from 'lucide-react';

const LOJA = {
  nome: 'Lili Materiais de Construção',
  endereco: 'Av. Argemiro Barbosa da Silva, 640',
  bairro: 'Centro',
  cidade: 'Bonfinópolis de Minas - MG',
  cep: '38650-000',
  telefone: '(38) 99914-4595',
  whatsapp: '5538999144595',
  whatsappLabel: '(38) 99914-4595',
  whatsapp2: '5538999571663',
  whatsappLabel2: '(38) 99957-1663',
  horarios: [
    { dia: 'Segunda a Sexta', hora: '07h às 17h30' },
    { dia: 'Sábado',          hora: '07h às 12h' },
    { dia: 'Domingo',         hora: 'Fechado' },
  ],
  fotos: [
    {
      url: 'https://res.cloudinary.com/dckhuy9ny/image/upload/v1778937291/ec91d7f3-5521-495d-a98c-c02064c7f812_cpmflf.jpg',
      alt: 'Entrada da loja',
    },
    {
      url: 'https://res.cloudinary.com/dckhuy9ny/image/upload/v1778937409/ChatGPT_Image_16_de_mai._de_2026_10_16_44_duxuts.png',
      alt: 'Equipe Lili Materiais',
    },
  ],
  mapsEmbed: 'https://maps.google.com/maps?q=Av.+Argemiro+Barbosa+da+Silva,+640,+Bonfinópolis+de+Minas,+MG,+38650-000&output=embed&hl=pt-BR',
  mapsLink: 'https://www.google.com/maps/search/Av.+Argemiro+Barbosa+da+Silva,+640,+Bonfinópolis+de+Minas,+MG,+38650-000',
};

export default function Lojas() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="font-heading font-extrabold text-2xl md:text-3xl uppercase tracking-tight text-gray-900 mb-8">
        Nossa Loja
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Informações */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm space-y-5">
            <h2 className="font-bold text-lg text-gray-900">{LOJA.nome}</h2>

            <div className="flex items-start gap-3 text-sm text-gray-600">
              <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p>{LOJA.endereco}</p>
                <p>{LOJA.bairro} — {LOJA.cidade}</p>
                <p>CEP: {LOJA.cep}</p>
                <a
                  href={LOJA.mapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary font-semibold text-xs mt-1 inline-block hover:underline"
                >
                  Ver no Google Maps →
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Phone className="h-5 w-5 text-primary flex-shrink-0" />
              <a href={`tel:${LOJA.telefone}`} className="hover:text-primary transition-colors">
                {LOJA.telefone}
              </a>
            </div>

            <div className="flex items-center gap-3 text-sm text-gray-600">
              <MessageCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
              <a
                href={`https://wa.me/${LOJA.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 font-semibold hover:text-green-700 transition-colors"
              >
                {LOJA.whatsappLabel} — WhatsApp
              </a>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <MessageCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
              <a
                href={`https://wa.me/${LOJA.whatsapp2}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 font-semibold hover:text-green-700 transition-colors"
              >
                {LOJA.whatsappLabel2} — WhatsApp
              </a>
            </div>

            <div className="flex items-start gap-3 text-sm text-gray-600">
              <Clock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                {LOJA.horarios.map(h => (
                  <div key={h.dia} className="flex gap-2">
                    <span className="text-gray-500 w-36">{h.dia}:</span>
                    <span className={h.hora === 'Fechado' ? 'text-red-400' : 'font-medium text-gray-800'}>
                      {h.hora}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Fotos */}
          <div className="grid grid-cols-2 gap-3">
            {LOJA.fotos.map(foto => (
              <div key={foto.url} className="aspect-[4/3] rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                <img
                  src={foto.url}
                  alt={foto.alt}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>

          {/* Botão WhatsApp */}
          <a
            href={`https://wa.me/${LOJA.whatsapp}?text=Olá! Vim pelo site e gostaria de informações.`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3.5 rounded-xl transition-colors text-sm"
          >
            <MessageCircle className="h-5 w-5" />
            Falar com a loja no WhatsApp
          </a>
        </div>

        {/* Mapa */}
        <div className="rounded-xl overflow-hidden border border-gray-100 shadow-sm h-[450px] lg:h-auto min-h-[350px]">
          <iframe
            src={LOJA.mapsEmbed}
            width="100%"
            height="100%"
            style={{ border: 0, minHeight: 350 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Localização Lili Materiais"
          />
        </div>
      </div>
    </div>
  );
}
