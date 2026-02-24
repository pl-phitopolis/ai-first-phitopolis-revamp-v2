
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Info } from 'lucide-react';
import { apolloClient } from '../../../lib/apollo-client';
import { GET_CAREER_BY_SLUG } from '../../../lib/graphql/queries';

interface Career {
  id: string;
  job_title: string;
  slug: string;
  department: string;
  location: string;
  job_type: string;
  experience_level?: string;
  short_description?: string;
  description?: string;
  responsibilities?: string;
  requirements?: string;
  nice_to_have?: string;
  skills?: string[] | string;
  salary_range?: string;
  benefits?: string;
}

interface CareerBySlugData {
  careers: Career[];
}

export default function JobDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<Career | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchCareer = async () => {
      if (!slug) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      try {
        const result = await apolloClient.query<CareerBySlugData>({
          query: GET_CAREER_BY_SLUG,
          variables: { slug },
        });

        if (result.data.careers && result.data.careers.length > 0) {
          setJob(result.data.careers[0]);
          document.title = `${result.data.careers[0].job_title} | Phitopolis`;
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error('Error fetching career:', error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchCareer();
  }, [slug]);

  // Helper function to render HTML content safely
  const renderHtmlContent = (htmlContent: string) => {
    return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
  };

  // Helper function to get skills array
  const getSkillsArray = (skills: string[] | string | undefined): string[] => {
    if (!skills) return [];
    if (Array.isArray(skills)) return skills;
    // If it's a string, try to parse as JSON
    try {
      const parsed = JSON.parse(skills);
      return Array.isArray(parsed) ? parsed : [skills];
    } catch {
      return [skills];
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (notFound || !job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4 text-primary">Job not found</h2>
          <Link to="/careers" className="text-accent hover:underline">Back to Careers</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pb-24 text-primary">
      <div className="container mx-auto px-6 py-12">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-slate-500 hover:text-primary mb-12 transition-colors"
        >
          <ArrowLeft size={18} className="mr-2" /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2 space-y-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-primary bg-accent/20 px-3 py-1 rounded-full">
                {job.department}
              </span>
              <h1 className="text-4xl md:text-6xl font-display font-bold mt-6 mb-4 text-primary">{job.job_title}</h1>
              <p className="text-slate-600">{job.location} • {job.job_type}</p>
            </div>

            {job.description && (
              <div className="prose prose-slate max-w-none">
                <h2 className="text-2xl font-bold text-primary mb-6">Role Overview</h2>
                <div className="text-slate-600 leading-relaxed wysiwyg-content">
                  {renderHtmlContent(job.description)}
                </div>
              </div>
            )}

            {job.responsibilities && (
              <div>
                <h2 className="text-2xl font-bold text-primary mb-6">Responsibilities</h2>
                <div className="text-slate-700 wysiwyg-content">
                  {renderHtmlContent(job.responsibilities as string)}
                </div>
              </div>
            )}

            {job.requirements && (
              <div>
                <h2 className="text-2xl font-bold text-primary mb-6">Requirements</h2>
                <div className="text-slate-700 wysiwyg-content">
                  {renderHtmlContent(job.requirements as string)}
                </div>
              </div>
            )}

            {job.skills && getSkillsArray(job.skills).length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-primary mb-6">Required Skills</h2>
                <div className="flex flex-wrap gap-3">
                  {getSkillsArray(job.skills).map((skill, index) => (
                    <span
                      key={index}
                      className="px-4 py-2.5 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/30 text-primary rounded-full text-sm font-semibold hover:from-accent/20 hover:to-accent/10 hover:border-accent hover:text-primary transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {job.nice_to_have && (
              <div>
                <h2 className="text-2xl font-bold text-primary mb-6">Nice to Have</h2>
                <div className="text-slate-700 wysiwyg-content">
                  {renderHtmlContent(job.nice_to_have)}
                </div>
              </div>
            )}

            {job.benefits && (
              <div>
                <h2 className="text-2xl font-bold text-primary mb-6">Benefits</h2>
                <div className="text-slate-700 wysiwyg-content">
                  {renderHtmlContent(job.benefits)}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-8">
            <div className="p-8 bg-slate-50 border border-slate-200 rounded-3xl sticky top-24 shadow-lg">
              <h3 className="text-xl font-bold mb-6 text-primary">Apply for this role</h3>

              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLSfx4qh0hhp-TVIWs7G3H9ezRxFSawoh14UtN7Kp858izVVydg/viewform"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 bg-accent hover:bg-accent-hover text-primary rounded-full font-bold flex items-center justify-center group transition-all hover:scale-105 active:scale-95 shadow-lg shadow-accent/20"
              >
                Submit Application
                <ExternalLink size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </a>

              <div className="mt-8 pt-8 border-t border-slate-200">
                <div className="flex items-center space-x-3 p-4 bg-primary/5 rounded-xl border border-primary/10">
                  <Info size={18} className="text-primary flex-shrink-0" />
                  <p className="text-xs text-slate-600">Our hiring process typically takes 2-3 weeks from first contact.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
