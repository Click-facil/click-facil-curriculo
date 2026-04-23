import { useState, useEffect } from "react";
import { Briefcase, MapPin, TrendingUp, ExternalLink, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  url: string;
  salary: string | null;
}

interface JobRecommendationsProps {
  userObjective: string;
  isPremium: boolean;
  onUpgrade: () => void;
}

export function JobRecommendations({ userObjective, isPremium, onUpgrade }: JobRecommendationsProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchJobs = async () => {
      if (!userObjective || userObjective.length < 3) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(false);

        const searchTerm = userObjective.split(' ').slice(0, 5).join(' ');
        const response = await fetch(`/api/get-jobs?role=${encodeURIComponent(searchTerm)}`);
        
        if (!response.ok) {
          throw new Error('Erro ao buscar vagas');
        }

        const data = await response.json();
        setJobs(data);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [userObjective]);

  if (loading) {
    return (
      <div className="mt-8 p-6 bg-card rounded-xl border border-border">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-6 w-6 rounded" />
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error || jobs.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 p-6 bg-card rounded-xl border border-border shadow-card">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h3 className="text-xl font-semibold text-foreground">
          Vagas em alta para {userObjective}
        </h3>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        {jobs.map((job) => (
          <div 
            key={job.id} 
            className="bg-muted/50 p-4 rounded-lg border border-border hover:border-primary/50 transition-all group"
          >
            <div className="flex items-start gap-2 mb-2">
              <Briefcase className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <h4 className="text-foreground font-medium line-clamp-2 group-hover:text-primary transition-colors" title={job.title}>
                {job.title}
              </h4>
            </div>
            
            <p className="text-muted-foreground text-sm mb-1 truncate">
              {job.company}
            </p>
            
            <div className="flex items-center gap-1 text-muted-foreground text-xs mb-3">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{job.location}</span>
            </div>

            {job.salary && (
              <p className="text-green-600 dark:text-green-400 text-sm font-semibold mb-3">
                Até {job.salary}
              </p>
            )}
            
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary text-sm font-medium hover:underline"
            >
              Ver vaga <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        ))}
      </div>

      {/* CTA Premium */}
      {!isPremium && (
        <div className="mt-6 text-center border-t border-border pt-6">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <p className="text-foreground font-semibold">
                Quer se destacar para essas empresas?
              </p>
            </div>
            <p className="text-muted-foreground text-sm mb-4">
              Templates premium + Carta de apresentação por IA = Currículo que passa no filtro dos recrutadores
            </p>
            <Button 
              onClick={onUpgrade}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Desbloquear Premium por R$ 9,90
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
