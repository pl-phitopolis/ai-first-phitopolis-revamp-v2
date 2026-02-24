
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Share2 } from 'lucide-react';
import { apolloClient } from '../../../lib/apollo-client';
import { GET_BLOG_BY_SLUG } from '../../../lib/graphql/queries';
import { getAssetUrl } from '../../../lib/utils';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  thumbnail?: {
    id: string;
  };
  tags?: string[];
  date_created: string;
  date_updated?: string;
  user_created?: {
    first_name: string;
    last_name: string;
  };
}

interface BlogBySlugData {
  blog: BlogPost[];
}

export default function BlogPostDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchBlog = async () => {
      if (!slug) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching blog with slug:', slug);
        const result = await apolloClient.query<BlogBySlugData>({
          query: GET_BLOG_BY_SLUG,
          variables: { slug },
          fetchPolicy: 'network-only',
        });

        console.log('Blog by slug - Full result:', result);
        console.log('Blog by slug - Data:', result.data);
        console.log('Blog by slug - Blog array:', result.data?.blog);
        console.log('Blog by slug - Array length:', result.data?.blog?.length);

        if (result.data?.blog && result.data.blog.length > 0) {
          console.log('Blog found:', result.data.blog[0]);
          console.log('Blog thumbnail:', result.data.blog[0].thumbnail);
          setPost(result.data.blog[0]);
          document.title = `${result.data.blog[0].title} | Phitopolis`;
        } else {
          console.log('No blog found for slug:', slug);
          console.log('Result data:', result.data);
          setNotFound(true);
        }
      } catch (error: any) {
        console.error('Error fetching blog post:', error);
        console.error('Error message:', error.message);
        console.error('Network error:', error.networkError);
        console.error('GraphQL errors:', error.graphQLErrors);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4 text-primary">Post not found</h2>
          <Link to="/blog" className="text-accent hover:underline">Back to Blog</Link>
        </div>
      </div>
    );
  }

  const authorName = post.user_created
    ? `${post.user_created.first_name} ${post.user_created.last_name}`
    : 'Phitopolis Team';
  const formattedDate = new Date(post.date_created).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const thumbnailUrl = getAssetUrl(post.thumbnail?.id);

  return (
    <div className="bg-white min-h-screen pb-24 text-primary">
      <div className="container mx-auto px-6 py-12">
        <Link to="/blog" className="flex items-center text-slate-500 hover:text-primary mb-12 transition-colors">
          <ArrowLeft size={18} className="mr-2" /> Back to Insights
        </Link>

        <article className="max-w-4xl mx-auto space-y-12">
          <div className="space-y-6">
            {post.tags && post.tags.length > 0 && (
              <div className="flex items-center space-x-4 text-sm font-bold uppercase tracking-widest text-accent">
                <span>{post.tags[0]}</span>
              </div>
            )}
            <h1 className="text-4xl md:text-7xl font-display font-bold leading-tight text-primary">{post.title}</h1>
            <div className="flex flex-wrap items-center gap-6 text-slate-500 border-b border-slate-100 pb-8">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                   <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=0A2A66&color=fff`} alt={authorName} />
                </div>
                <span className="font-medium text-primary">{authorName}</span>
              </div>
              <div className="flex items-center space-x-2"><Calendar size={16} className="text-accent" /> <span>{formattedDate}</span></div>
              <button className="flex items-center space-x-2 ml-auto text-accent hover:text-accent-hover font-bold">
                <Share2 size={16} /> <span>Share</span>
              </button>
            </div>
          </div>

          <div className="aspect-video bg-slate-100 rounded-3xl overflow-hidden border border-slate-200 shadow-md">
             <img src={thumbnailUrl} className="w-full h-full object-cover" alt={post.title} />
          </div>

          {post.content && (
            <div className="prose prose-lg max-w-none text-slate-600 leading-relaxed wysiwyg-content">
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </div>
          )}
        </article>

        {/* Author Bio */}
        <div className="max-w-4xl mx-auto mt-24 p-8 bg-slate-50 border border-slate-200 rounded-3xl flex items-center gap-8 shadow-sm">
           <div className="w-24 h-24 bg-slate-200 rounded-2xl overflow-hidden flex-shrink-0 border border-slate-300">
              <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=0A2A66&color=fff&size=128`} alt={authorName} className="w-full h-full object-cover" />
           </div>
           <div>
              <h4 className="font-bold text-lg mb-2 text-primary">Written by {authorName}</h4>
              <p className="text-slate-600 text-sm">
                A member of the Phitopolis team dedicated to excellence and community involvement.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}