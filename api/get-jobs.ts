import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Apenas GET
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { role } = req.query;

  if (!role || typeof role !== 'string') {
    return res.status(400).json({ message: 'Parâmetro "role" é obrigatório' });
  }

  const appId = process.env.ADZUNA_APP_ID || 'dd514507';
  const appKey = process.env.ADZUNA_APP_KEY || '46aed95d15d587a6d91c65ea';

  try {
    const url = `https://api.adzuna.com/v1/api/jobs/br/search/1?app_id=${appId}&app_key=${appKey}&results_per_page=3&what=${encodeURIComponent(role)}&sort_by=date`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        'Referer': 'https://www.adzuna.com.br/',
        'Origin': 'https://www.adzuna.com.br',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Adzuna API error:', response.status, errorText);
      throw new Error(`Adzuna API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      return res.status(200).json([]);
    }

    // Mapear para formato limpo
    const jobs = data.results.map((job: any) => ({
      id: job.id,
      title: job.title,
      company: job.company?.display_name || 'Empresa não informada',
      location: job.location?.display_name || 'Brasil',
      url: job.redirect_url,
      salary: job.salary_max ? `R$ ${Math.round(job.salary_max)}` : null,
    }));

    // Cache de 6 horas para reduzir requisições
    res.setHeader('Cache-Control', 's-maxage=21600, stale-while-revalidate');
    return res.status(200).json(jobs);
  } catch (error) {
    console.error('Erro na integração Adzuna:', error);
    return res.status(500).json({ message: 'Não foi possível carregar as vagas no momento.' });
  }
}
