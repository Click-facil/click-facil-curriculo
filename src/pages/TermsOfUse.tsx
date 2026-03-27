import { ArrowLeft, FileText, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LAST_UPDATED = "27 de março de 2026";
const CONTACT_EMAIL = "solucoesdigitais.clickfacil@gmail.com";
const SITE_URL = "https://click-facil-curriculo.vercel.app";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-8">
    <h2 className="text-lg font-bold text-foreground mb-3 pb-2 border-b border-border">
      {title}
    </h2>
    <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
      {children}
    </div>
  </section>
);

const TermsOfUse = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-hero text-primary-foreground py-8 shadow-elevated">
        <div className="container max-w-3xl mx-auto px-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm opacity-75 hover:opacity-100 transition-opacity mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar ao início
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-display">Termos de Uso</h1>
              <p className="text-sm opacity-70">Última atualização: {LAST_UPDATED}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container max-w-3xl mx-auto px-4 py-10">
        <div className="bg-card rounded-xl border border-border shadow-card p-6 md:p-10">

          <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
            Estes Termos de Uso regem o acesso e uso do serviço <strong className="text-foreground">Click Fácil — Gerador de Currículo</strong>,
            disponível em <a href={SITE_URL} className="text-primary hover:underline">{SITE_URL}</a>,
            operado pela marca Click Fácil. Ao usar o serviço, você concorda com estes termos.
            Se não concordar, não utilize o serviço.
          </p>

          <Section title="1. O que é o Click Fácil">
            <p>
              O Click Fácil é uma ferramenta web gratuita para criação de currículos profissionais.
              O serviço oferece templates gratuitos para download sem cadastro e templates premium
              disponíveis mediante pagamento único. Não somos uma agência de empregos, não garantimos
              contratações e não nos responsabilizamos pelo uso do currículo gerado.
            </p>
          </Section>

          <Section title="2. Uso permitido">
            <p>Você pode usar o Click Fácil para:</p>
            <ul className="list-disc list-inside space-y-1.5">
              <li>Criar currículos para uso pessoal e profissional próprio</li>
              <li>Baixar e distribuir seu próprio currículo gerado pela plataforma</li>
              <li>Criar uma conta para salvar e acessar seus currículos</li>
            </ul>
          </Section>

          <Section title="3. Uso proibido">
            <p>É expressamente proibido:</p>
            <ul className="list-disc list-inside space-y-1.5">
              <li>Usar a plataforma para criar currículos com informações falsas ou fraudulentas</li>
              <li>Tentar contornar, burlar ou reverter engenharia do sistema de pagamento ou de bloqueio de templates</li>
              <li>Usar scripts, bots ou automações para acessar ou sobrecarregar o serviço</li>
              <li>Revender, sublicenciar ou comercializar o acesso aos templates premium</li>
              <li>Usar o serviço para qualquer finalidade ilegal nos termos da legislação brasileira</li>
            </ul>
            <p>
              O descumprimento pode resultar em suspensão do acesso sem aviso prévio e sem direito a reembolso.
            </p>
          </Section>

          <Section title="4. Propriedade intelectual">
            <p>
              Os templates, o design, o código e a identidade visual do Click Fácil são de
              propriedade exclusiva da marca Click Fácil e protegidos pela legislação de
              direitos autorais. O pagamento pelos templates premium concede ao usuário
              uma <strong className="text-foreground">licença pessoal, intransferível e não exclusiva</strong> para
              uso dos currículos gerados — não transfere a propriedade dos templates em si.
            </p>
            <p>
              O conteúdo inserido por você no currículo (textos, dados pessoais, foto) é de
              sua exclusiva propriedade. Não reivindicamos qualquer direito sobre ele.
            </p>
          </Section>

          <Section title="5. Pagamentos e reembolsos">
            <p>
              O acesso aos templates premium é cobrado mediante <strong className="text-foreground">pagamento único de R$ 9,90</strong>,
              processado pelo Mercado Pago. Após a confirmação do pagamento:
            </p>
            <ul className="list-disc list-inside space-y-1.5">
              <li>O acesso é liberado imediatamente para download</li>
              <li>Usuários cadastrados têm acesso vitalício vinculado à sua conta</li>
              <li>Usuários não cadastrados recebem acesso no dispositivo via confirmação manual</li>
            </ul>
            <p>
              <strong className="text-foreground">Política de reembolso:</strong> devido à natureza digital
              do produto (download imediato), não realizamos reembolsos após o download ter sido
              efetuado. Em caso de problema técnico que impeça o download após pagamento confirmado,
              entre em contato em até 7 dias e resolveremos.
            </p>
          </Section>

          <Section title="6. Disponibilidade do serviço">
            <p>
              Nos esforçamos para manter o serviço disponível 24/7, mas não garantimos
              disponibilidade ininterrupta. Podemos realizar manutenções, atualizações ou
              descontinuar funcionalidades sem aviso prévio. Não nos responsabilizamos por
              perdas decorrentes de indisponibilidade temporária.
            </p>
            <p>
              Dados armazenados apenas no localStorage do navegador podem ser perdidos se
              o usuário limpar os dados do navegador. Recomendamos criar uma conta gratuita
              para garantir a persistência do currículo.
            </p>
          </Section>

          <Section title="7. Limitação de responsabilidade">
            <p>
              O Click Fácil fornece a ferramenta "no estado em que se encontra". Não nos
              responsabilizamos por:
            </p>
            <ul className="list-disc list-inside space-y-1.5">
              <li>Resultado de processos seletivos com currículos gerados pela plataforma</li>
              <li>Perda de dados armazenados localmente no navegador do usuário</li>
              <li>Danos indiretos decorrentes do uso ou impossibilidade de uso do serviço</li>
              <li>Conteúdo inserido pelo usuário que viole direitos de terceiros</li>
            </ul>
          </Section>

          <Section title="8. Alterações nos termos">
            <p>
              Podemos atualizar estes Termos periodicamente. Alterações significativas serão
              comunicadas via aviso no site. O uso continuado após a publicação das alterações
              constitui aceite dos novos termos.
            </p>
          </Section>

          <Section title="9. Legislação e foro">
            <p>
              Estes Termos são regidos pelas leis da República Federativa do Brasil.
              Fica eleito o foro da comarca de <strong className="text-foreground">Belém, Estado do Pará</strong>,
              como o competente para dirimir quaisquer controvérsias decorrentes deste instrumento,
              com renúncia expressa a qualquer outro, por mais privilegiado que seja.
            </p>
          </Section>

          <Section title="10. Contato">
            <p>
              Dúvidas sobre estes termos ou sobre o serviço:
            </p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="inline-flex items-center gap-2 mt-2 px-4 py-2.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-medium text-sm transition-colors"
            >
              <Mail className="w-4 h-4" />
              {CONTACT_EMAIL}
            </a>
          </Section>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Click Fácil. Todos os direitos reservados.
      </footer>
    </div>
  );
};

export default TermsOfUse;