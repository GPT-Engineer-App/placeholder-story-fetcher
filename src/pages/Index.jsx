import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

const fetchTopStories = async () => {
  const response = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
  const storyIds = await response.json();
  return storyIds.slice(0, 100);
};

const fetchStory = async (id) => {
  const response = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
  return response.json();
};

const StoryItem = ({ story }) => (
  <div className="border-b border-gray-200 py-4">
    <h2 className="text-lg font-semibold">{story.title}</h2>
    <p className="text-sm text-gray-500">Upvotes: {story.score}</p>
    <a
      href={story.url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-500 hover:underline"
    >
      Read more
    </a>
  </div>
);

const SkeletonLoader = () => (
  <div className="space-y-4">
    {[...Array(10)].map((_, index) => (
      <div key={index} className="border-b border-gray-200 py-4">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/4 mb-2" />
        <Skeleton className="h-4 w-1/6" />
      </div>
    ))}
  </div>
);

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: storyIds, isLoading: isLoadingIds } = useQuery({
    queryKey: ['topStories'],
    queryFn: fetchTopStories
  });

  const { data: stories, isLoading: isLoadingStories } = useQuery({
    queryKey: ['stories', storyIds],
    queryFn: async () => {
      if (!storyIds) return [];
      return Promise.all(storyIds.map(fetchStory));
    },
    enabled: !!storyIds
  });

  const filteredStories = stories?.filter(story =>
    story.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Hacker News Top 100 Stories</h1>
      <Input
        type="text"
        placeholder="Search stories..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-6"
      />
      {isLoadingIds || isLoadingStories ? (
        <SkeletonLoader />
      ) : (
        <div className="space-y-4">
          {filteredStories?.map(story => (
            <StoryItem key={story.id} story={story} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Index;