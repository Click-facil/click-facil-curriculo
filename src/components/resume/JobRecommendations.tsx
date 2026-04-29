import { useState, useEffect } from "react";
import { Briefcase, MapPin, ExternalLink, Sparkles, TrendingUp } from "lucide-react";
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
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="h-10 w-10 rounded" />
          <Skeleton className="h-6 w-48" />
        </div>
        <Skeleton className="h-48 rounded-lg" />
      </div>
    );
  }

  if (error || jobs.length === 0) {
    return null;
  }

  // Extrai palavra-chave principal do objetivo
  const mainKeyword = userObjective.split(' ').slice(0, 3).join(' ');

  return (
    <div className="mt-8 p-6 bg-gradient-to-br from-card to-muted/30 rounded-xl border border-border shadow-lg">
      {/* Header com ícone */}
      <div className="flex items-center gap-3 mb-6">
        {/* SVG Simples - Ícone de Vagas */}
        <div className="w-10 h-10 flex-shrink-0 text-primary">
          <svg viewBox="0 0 40 40" className="w-full h-full" fill="currentColor">
            <rect x="8" y="12" width="24" height="20" rx="2" fill="none" stroke="currentColor" strokeWidth="2"/>
            <rect x="12" y="8" width="16" height="4" rx="1" fill="currentColor"/>
            <line x1="14" y1="18" x2="26" y2="18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="14" y1="23" x2="26" y2="23" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="14" y1="28" x2="22" y2="28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary flex-shrink-0" />
            <span className="truncate">Vagas em alta</span>
          </h3>
          <p className="text-sm text-muted-foreground truncate">{mainKeyword}</p>
        </div>
      </div>
      
      {/* Scroll - horizontal mobile, vertical desktop */}
      <div className="relative">
        {/* Mobile: scroll horizontal */}
        <div className="md:hidden flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent hover:scrollbar-thumb-primary/40">
          {jobs.map((job) => (
            <div 
              key={job.id} 
              className="flex-shrink-0 w-[280px] bg-card p-5 rounded-lg border border-border hover:border-primary/50 hover:shadow-md transition-all snap-start group"
            >
              <div className="flex items-start gap-2 mb-3">
                <Briefcase className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                <h4 className="text-foreground font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors" title={job.title}>
                  {job.title}
                </h4>
              </div>
              
              <p className="text-muted-foreground text-sm font-medium mb-2 truncate">
                {job.company}
              </p>
              
              <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-3">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{job.location}</span>
              </div>

              {job.salary && (
                <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded px-2 py-1 mb-3">
                  <p className="text-green-700 dark:text-green-400 text-xs font-semibold">
                    Até {job.salary}
                  </p>
                </div>
              )}
              
              <a
                href={job.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-primary text-sm font-medium hover:underline mt-2"
              >
                Ver detalhes <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}
        </div>
        
        {/* Desktop: scroll vertical */}
        <div className="hidden md:block max-h-[400px] overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent hover:scrollbar-thumb-primary/40">
          {jobs.map((job) => (
            <div 
              key={job.id} 
              className="bg-card p-5 rounded-lg border border-border hover:border-primary/50 hover:shadow-md transition-all group"
            >
              <div className="flex items-start gap-2 mb-3">
                <Briefcase className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                <h4 className="text-foreground font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors" title={job.title}>
                  {job.title}
                </h4>
              </div>
              
              <p className="text-muted-foreground text-sm font-medium mb-2 truncate">
                {job.company}
              </p>
              
              <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-3">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{job.location}</span>
              </div>

              {job.salary && (
                <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded px-2 py-1 mb-3">
                  <p className="text-green-700 dark:text-green-400 text-xs font-semibold">
                    Até {job.salary}
                  </p>
                </div>
              )}
              
              <a
                href={job.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-primary text-sm font-medium hover:underline mt-2"
              >
                Ver detalhes <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
