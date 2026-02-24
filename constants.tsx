
import React from 'react';
import { 
  Cpu, 
  Database, 
  Layout, 
  LineChart, 
  Search, 
  Code,
  Globe,
  Users
} from 'lucide-react';
import { ServiceType, Job, BlogPost, Service, TeamMember } from './types';

export const SERVICES: Service[] = [
  {
    type: ServiceType.RD,
    title: "Research & Development",
    description: "Pioneering new technologies and frameworks to solve complex enterprise problems.",
    icon: <Cpu className="w-8 h-8 text-primary" />,
    features: ["Custom Algorithm Design", "Proof of Concept Building", "Performance Optimization"],
    image: "https://phitopolis.com/img/core-competencies/innovation.jpg",
    story: "A Tier-1 trading firm's HFT pipeline was bottlenecked at 2ms end-to-end latency—unacceptable in a market where microseconds are alpha. We bypassed the Linux network stack entirely with DPDK kernel-bypass, implemented a custom lock-free SPSC ring buffer in C++, and deployed NUMA-aware memory allocation to eliminate cross-socket cache misses. Final result: 18μs median latency, P99 under 40μs—a 100x improvement that directly translated to measurable edge in the market."
  },
  {
    type: ServiceType.DATA_SCIENCE,
    title: "Data Science",
    description: "Extracting actionable insights from vast datasets through ML and statistical modeling.",
    icon: <Database className="w-8 h-8 text-primary" />,
    features: ["Predictive Analytics", "Natural Language Processing", "Quant Strategy Dev"],
    image: "https://phitopolis.com/img/core-competencies/technical-excellence.jpg",
    story: "A global hedge fund needed to extract signal from 50,000+ financial research papers per quarter—an impossible manual task. We deployed a fine-tuned transformer pipeline with semantic chunking, domain-specific embeddings, and a custom vector store. The system auto-classifies, de-duplicates, and surfaces statistically significant alpha signals in real time. Analyst throughput increased 8x, and the fund identified 3 novel strategy themes within the first month of deployment."
  },
  {
    type: ServiceType.FULL_STACK,
    title: "Full-Stack Engineering",
    description: "Building resilient, scalable, and high-performance applications for the modern web.",
    icon: <Layout className="w-8 h-8 text-primary" />,
    features: ["High-Frequency Systems", "Cloud-Native Architecture", "Real-time Dashboards"],
    image: "https://phitopolis.com/img/core-competencies/proactive-communication.jpg",
    story: "A prime brokerage needed to monitor 4M+ transactions/second across 12 asset classes with a legacy dashboard that refreshed every 30 seconds. We re-architected the entire stack: Kafka-backed event bus, Flink stream processor, Redis CRDT for conflict-free state, and a React frontend with binary WebSocket frames. The new system delivers sub-50ms UI refresh at peak load, handles 10x traffic spikes without degradation, and reduced operational incidents by 90%."
  }
];

export const JOBS: Job[] = [
  {
    id: "1",
    slug: "senior-quant-engineer",
    title: "Senior Quantitative Engineer",
    department: "Engineering",
    location: "BGC, Taguig / Remote",
    type: "Full-time",
    description: "We are looking for a high-caliber engineer to build low-latency trading infrastructure.",
    requirements: ["5+ years C++/Python", "Strong Mathematical background", "Experience in Finance"],
    benefits: ["Competitive Equity", "Remote-first culture", "Modern Tech Stack"]
  },
  {
    id: "2",
    slug: "data-scientist-ml",
    title: "Lead Data Scientist (ML)",
    department: "Data Science",
    location: "Remote",
    type: "Full-time",
    description: "Drive our machine learning initiatives and architect scalable data pipelines.",
    requirements: ["PhD/Masters in CS or Math", "PyTorch/Tensorflow expertise", "NLP experience"],
    benefits: ["Flexible hours", "Learning budget", "Health Insurance"]
  }
];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: "4",
    slug: "phitopolis-6th-anniversary-wild-west",
    title: "Riding into Our 6th Year: Phitopolis’ Wild West Anniversary Celebration",
    excerpt: "Phitopolis saddled up and rode into a new frontier, celebrating six remarkable years of growth, innovation, and camaraderie.",
    author: "Kobbie Manrique and Josua Costibolo",
    date: "Aug 27, 2025",
    readTime: "7 min read",
    category: "Events & Culture",
    thumbnail: "https://phitopolis.com/blog/wp-content/uploads/2025/08/a0a499d4-3f45-4bd7-9db5-870f125ffc91.jpg",
    contentImages: [
      undefined,
      undefined,
      undefined,
      "https://phitopolis.com/blog/wp-content/uploads/2025/08/Screenshot-2025-08-20-083451.png",
      undefined,
      undefined,
      undefined,
      "https://phitopolis.com/blog/wp-content/uploads/2025/08/Untitled-design-10-682x1024.png",
      "https://phitopolis.com/blog/wp-content/uploads/2025/08/42a0de2d-e49e-44f4-83e4-2f159ed7852f.png",
      undefined,
      "https://phitopolis.com/blog/wp-content/uploads/2025/08/fdb10fa5-93ef-4157-b656-1ab641adf7f4.png",
      undefined,
      undefined,
      undefined,
      "https://phitopolis.com/blog/wp-content/uploads/2025/08/3029999c-3cc5-4a42-8e66-c1d181babbc3.png",
      undefined,
      undefined,
      undefined,
      undefined,
      "https://phitopolis.com/blog/wp-content/uploads/2025/08/cc100c93-f4c9-43f0-92bc-a9a0a401cc71.png"
    ],
    content: `This year, Phitopolis saddled up and rode into a new frontier, celebrating six remarkable years of growth, innovation, and camaraderie. From our humble beginnings to the thriving, tight-knit community we are today, these six years have been filled with challenges overcome, milestones achieved, and countless shared memories.

To honor this incredible journey, we gathered the whole company at Buffalo Wild Wings for a Wild West–themed celebration and brought together colleagues, friends, and partners for an evening of reflection, recognition, and pure fun.

Setting the Scene
To kick off the program, our CTO, Mark Walbaum, officially opened the event by sharing reflections on how far we’ve come and expressing gratitude for the people who have made it possible. We also received a special message from Ben Cilia, Chief Data Officer of Quantbot Technologies, adding another layer of inspiration to the evening.

Spotlight on Our Stars
In true Phitopolis fashion, we took a moment to shine the spotlight on individuals and teams who have made a significant impact over the past month. Recognizing and celebrating each other’s contributions remains at the heart of our culture, a tradition that continues to strengthen our bonds.

Capturing the Moment
Before diving into dinner, everyone gathered for a group photo, capturing the spirit of togetherness that defines Phitopolis. We also had a photobooth corner, giving everyone a chance to capture the moment and take home a fun souvenir.

A Feast Fit for a Cowboy
As plates filled and glasses clinked, the room buzzed with conversation and laughter. This year’s menu was full and hearty, which fueled us for the games and activities ahead.

Buffalo Wild Wings delivered the goods—plates of wings, tacos, pastas, and hearty bites that kept everyone fueled for the games ahead. Between bites, conversations flowed with ease, filled with stories, laughter, and a few lighthearted debates about which food on the menu was the best.

Games That Had Us Hollerin’
We kicked off with “Who Said It? ”, a hilarious game where employees guessed which colleague was behind memorable quotes from Slack, meetings, and team banter. Laughter echoed as we revisited a collection of one-liners that remained truly unforgettable.

Next came the Company Timeline Challenge, testing everyone’s knowledge of our history. Teams pieced together milestones in the right order, from Phitopolis’s incorporation with just a few people to now occupying an entire office floor to support our growing team.. It was part memory test, part friendly competition, and 100% fun.

The final challenge was “Guess That Song,” a musical showdown where snippets of lyrics had players racing to name the song and artist. From throwback classics to modern hits, the game proved that our team’s playlist knowledge is as diverse as it is impressive.

Riding off into the Sunset
As the evening drew to a close, our CTO, Mark Walbaum, gave a heartfelt closing remark, thanking everyone for their dedication and passion over the years.

This 6th anniversary was more than a party; it was a celebration of the journey we’ve taken together and the exciting road ahead. To everyone who has been part of our story so far: thank you for making Phitopolis the spirited, trailblazing community it is today.

Here’s to new frontiers, stronger bonds, and bigger dreams.

Happy 6th Anniversary, Phitopolis! 🤠🎉`
  },
  {
    id: "3",
    slug: "joy-in-every-bag-christmas-gift-giving",
    title: "Joy in Every Bag: Christmas Gift Giving at Brgy. Pinagsama",
    excerpt: "It’s that time of the year again when giving back takes center stage, as we bring Christmas cheer to the children of Barangay Pinagsama.",
    author: "Bea Franco",
    date: "Dec 18, 2025",
    readTime: "5 min read",
    category: "Community & CSR",
    thumbnail: "https://phitopolis.com/blog/wp-content/uploads/2025/12/001-2048x1536.jpg",
    contentImages: [
      "https://phitopolis.com/blog/wp-content/uploads/2025/12/2.png",
      "https://phitopolis.com/blog/wp-content/uploads/2025/12/3.png",
      "https://phitopolis.com/blog/wp-content/uploads/2025/12/4.png"
    ],
    content: `It’s that time of the year again when giving back takes center stage, as we bring Christmas cheer to the children of Barangay Pinagsama. This year, despite a light drizzle, Phitopolis brought the holiday spirit to life—donning our freshly issued 2025 Christmas shirts and coming together to share joy with the community. Excitement and festive energy filled the air, reminding us why giving back is a tradition we look forward to every year.

At first, some of the children were shy, peeking from behind their parents or hesitating to join in. Denise led the opening remarks, breaking the ice with her warm and friendly approach. Soon, the children were laughing and playing, filling the area with energy. Their excitement set the perfect tone for a morning full of giving and connection.

The highlight of the day was the gift-giving. Each child received a bag filled with essentials like school supplies, toiletries, and snacks. Watching them explore their gifts and express gratitude reminded us why giving back matters. Every laugh, playful gesture, and shared moment made the morning truly rewarding.

This year’s Christmas gift-giving CSR was made possible through the collaboration of Phitopolis volunteers and the local officials of Barangay Pinagsama. Together, we celebrated the season through community, connection, and kindness. Joy in Every Bag truly came to life that morning, reminding us that the holiday season is best celebrated by giving back and sharing joy with others.`
  }
];

// Added TEAM constant to resolve missing export error in app/team/page.tsx
export const TEAM: TeamMember[] = [
  {
    id: "1",
    name: "Mark Walbaum",
    role: "Chief Technology Officer",
    bio: "Former Executive Director at Morgan Stanley with 20+ years of experience in distributed systems and high-frequency trading infrastructure.",
    image: "https://phitopolis.com/img/core-competencies/teamwork-and-leadership.jpg",
    expertise: ["Low Latency", "Distributed Systems", "FinTech"]
  },
  {
    id: "2",
    name: "Ben Cilia",
    role: "Chief Data Officer",
    bio: "Data visionary specializing in quantitative analytics and machine learning strategies for large-scale financial institutions.",
    image: "https://phitopolis.com/img/core-competencies/innovation.jpg",
    expertise: ["Data Science", "ML Ops", "Quant Strategy"]
  }
];
