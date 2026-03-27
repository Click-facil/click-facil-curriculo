import { ArrowLeft, Shield, Mail } from "lucide-react";
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

const PrivacyPolicy = () => {
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
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-display">Política de Privacidade</h1>
              <p className="text-sm opacity-70">Última atualização: {LAST_UPDATED}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container max-w-3xl mx-auto px-4 py-10">
        <div className="bg-card rounded-xl border border-border shadow-card p-6 md:p-10">

          <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
            A <strong className="text-foreground">Click Fácil</strong> é uma marca digital operada por pessoa física,
            com foco em ferramentas web gratuitas e acessíveis. Esta política descreve como tratamos
            os dados de quem usa o Gerador de Currículo disponível em{" "}
            <a href={SITE_URL} className="text-primary hover:underline">{SITE_URL}</a>.
            Levamos privacidade a sério — coletamos apenas o mínimo necessário para o funcionamento do serviço.
          </p>

          <Section title="1. Quais dados coletamos">
            <p>
              <strong className="text-foreground">Dados que você preenche no currículo</strong> — nome, e-mail,
              telefone, endereço, experiências, formação e demais informações inseridas voluntariamente.
              Esses dados são armazenados <em>exclusivamente no seu navegador</em> (localStorage) e
              nunca são enviados para nossos servidores, a menos que você crie uma conta.
            </p>
            <p>
              <strong className="text-foreground">Dados de conta (opcional)</strong> — se você optar por criar
              uma conta, coletamos seu e-mail e nome fornecidos via Google ou cadastro direto.
              Esses dados são armazenados com segurança no Firebase (Google LLC).
            </p>
            <p>
              <strong className="text-foreground">Dados de pagamento</strong> — transações realizadas via
              Mercado Pago são processadas integralmente pela plataforma deles. Não temos acesso
              a dados de cartão ou informações bancárias.
            </p>
            <p>
              <strong className="text-foreground">Dados de navegação</strong> — utilizamos o Google Analytics
              para entender como o site é usado (páginas visitadas, tempo de sessão, origem do tráfego).
              Esses dados são anonimizados e agregados.
            </p>
          </Section>

          <Section title="2. Como usamos os dados">
            <ul className="list-disc list-inside space-y-1.5">
              <li>Permitir a criação, edição e download do currículo</li>
              <li>Autenticar usuários cadastrados e preservar o acesso premium</li>
              <li>Confirmar pagamentos e liberar templates premium</li>
              <li>Melhorar a experiência do produto com base em dados agregados de uso</li>
              <li>Responder a solicitações de suporte enviadas por e-mail</li>
            </ul>
            <p>
              Não utilizamos seus dados para fins publicitários personalizados, não os vendemos
              e não os compartilhamos com terceiros além dos fornecedores de infraestrutura
              listados nesta política.
            </p>
          </Section>

          <Section title="3. Cookies e rastreamento">
            <p>
              O site utiliza cookies técnicos essenciais para funcionamento (sessão de autenticação)
              e cookies analíticos via <strong className="text-foreground">Google Analytics 4</strong>.
              Os cookies analíticos coletam dados de forma anônima e podem ser bloqueados nas
              configurações do seu navegador sem prejuízo ao uso da ferramenta.
            </p>
            <p>
              Não utilizamos cookies de rastreamento publicitário de terceiros.
            </p>
          </Section>

          <Section title="4. Armazenamento e segurança">
            <p>
              Os dados de conta e preferências de usuários cadastrados são armazenados no
              <strong className="text-foreground"> Firebase Firestore</strong> (Google LLC), com
              criptografia em trânsito (HTTPS/TLS) e em repouso. As regras de acesso do banco
              garantem que cada usuário acessa apenas seus próprios dados.
            </p>
            <p>
              Os dados do currículo de usuários não cadastrados ficam apenas no seu dispositivo,
              no localStorage do navegador. Limpar os dados do navegador apaga essas informações
              permanentemente — por isso recomendamos criar uma conta para não perder seu trabalho.
            </p>
          </Section>

          <Section title="5. Seus direitos (LGPD)">
            <p>
              Nos termos da Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você tem direito a:
            </p>
            <ul className="list-disc list-inside space-y-1.5">
              <li>Confirmar a existência de tratamento dos seus dados</li>
              <li>Acessar os dados que mantemos sobre você</li>
              <li>Corrigir dados incompletos ou desatualizados</li>
              <li>Solicitar a exclusão dos seus dados a qualquer momento</li>
              <li>Revogar o consentimento dado</li>
            </ul>
            <p>
              Para exercer qualquer um desses direitos, entre em contato pelo e-mail abaixo.
              Respondemos em até 5 dias úteis.
            </p>
          </Section>

          <Section title="6. Retenção de dados">
            <p>
              Dados de conta são mantidos enquanto a conta estiver ativa. Ao solicitar exclusão,
              removemos seus dados em até 30 dias, exceto onde houver obrigação legal de retenção.
              Dados de transações ficam armazenados pelo Mercado Pago conforme a política deles.
            </p>
          </Section>

          <Section title="7. Alterações nesta política">
            <p>
              Podemos atualizar esta política periodicamente. Alterações relevantes serão
              comunicadas via aviso no site. O uso continuado do serviço após as alterações
              implica aceitação da versão atualizada.
            </p>
          </Section>

          <Section title="8. Contato">
            <p>
              Para dúvidas, solicitações ou reclamações relacionadas à privacidade:
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

export default PrivacyPolicy;