import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, ShieldCheck, CreditCard, MessageCircle, ArrowRight } from 'lucide-react';

const benefits = [
  {
    icon: Truck,
    title: 'Atendimento Especializado',
    desc: 'Equipe pronta para te ajudar',
  },
  {
    icon: MessageCircle,
    title: 'Orçamento via WhatsApp',
    desc: 'Rápido e sem burocracia',
  },
  {
    icon: CreditCard,
    title: '5% OFF no Pix',
    desc: 'E parcelamento em até 10x',
  },
  {
    icon: ShieldCheck,
    title: 'Compra Segura',
    desc: 'Ambiente 100% protegido',
  },
];

export default function PromoBanner() {
  return (
    <>
      {/* Faixa de benefícios */}
      <section className="bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {benefits.map(({ icon: Icon, title, desc }, i) => (
              <div
                key={title}
                className={[
                  'py-5 px-4 md:px-6 flex items-center gap-3 border-gray-200',
                  i % 2 === 1 ? 'border-l' : '',
                  i < 2 ? 'border-b md:border-b-0' : '',
                  i === 2 ? 'md:border-l' : '',
                  i === 3 ? 'md:border-l' : '',
                ].filter(Boolean).join(' ')}
              >
                <div className="w-11 h-11 flex-shrink-0 bg-primary/10 rounded-full flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-xs text-gray-800 leading-tight">{title}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Banner profissionais */}
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4">
          <div
            className="relative overflow-hidden rounded-sm"
            style={{ background: 'linear-gradient(135deg, #A62C2C 0%, #7a1f1f 100%)' }}
          >
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)', backgroundSize: '20px 20px' }}
            />
            <div className="relative flex flex-col md:flex-row items-center justify-between gap-6 p-8 md:p-12">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-yellow-400 mb-2 block">
                  Para Profissionais
                </span>
                <h2 className="font-heading font-extrabold text-2xl md:text-3xl text-white uppercase tracking-tight leading-tight">
                  Condições Especiais<br />para Construtoras
                </h2>
                <p className="text-white/60 text-sm mt-3 max-w-md">
                  Preços diferenciados, prazos estendidos e atendimento exclusivo para profissionais da construção civil.
                </p>
              </div>
              <a
                href="https://wa.me/5538999144595"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 inline-flex items-center justify-center gap-2 border-2 border-white text-white font-heading text-sm font-bold uppercase tracking-wider px-8 py-4 min-h-[52px] hover:bg-white hover:text-[#A62C2C] transition-colors w-full md:w-auto rounded-sm"
              >
                Falar com Consultor
                <ArrowRight className="h-4 w-4 flex-shrink-0" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
