"use client"
import React, { useState, useEffect, useRef } from "react";
import Header from "../Header";
import DOMPurify from "dompurify";
import YouTube from 'react-youtube';

const cleanHTML = (html) => {
  // Use DOMPurify to sanitize and clean the HTML
  const sanitizedHTML = DOMPurify.sanitize(html);

  // Remove content between square brackets that starts with 'fusion_builder_'
  const cleanedHTML = sanitizedHTML.replace(/\[\/?fusion_[^\]]*\]/g, '');

  // Convert the HTML string to a DOM object
  const doc = new DOMParser().parseFromString(cleanedHTML, 'text/html');

  // Remove unwanted elements by specific criteria
  doc.querySelectorAll('[data-tag="fusion_builder"]').forEach((element) => {
    // Add more specific conditions if needed, e.g., checking parent nodes, attributes, etc.
    if (element.tagName.toLowerCase() === 'div') {
      element.parentNode.removeChild(element);
    }
  });

  // Create a Set to store unique content
  const uniqueContent = new Set();

  // Iterate through paragraphs and add unique content to the Set
  doc.querySelectorAll('p').forEach((paragraph) => {
    uniqueContent.add(paragraph.outerHTML);
  });

  // Create a new document to build the cleaned HTML
  const finalCleanedDoc = new DOMParser().parseFromString('<div></div>', 'text/html');

  // Append unique paragraphs to the new document
  uniqueContent.forEach((paragraphHTML) => {
    finalCleanedDoc.body.innerHTML += paragraphHTML;
  });

  // Serialize the cleaned document back to HTML
  const finalCleanedHTML = finalCleanedDoc.body.innerHTML;

  return finalCleanedHTML;
};

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const loaderRef = useRef(null);
  const isInitialFetch = useRef(true);
  const fetchTrigger = useRef(false);

  const fetchVideos = async () => {
    try {
      const channelId = 'UC6TjRdvXOknZBbtXiePp1HA'; // "mautskebeli" channel ID
      const apiKey = 'AIzaSyBb5OYl80XD7WFlYU13SoSA9e4htPf8TrE';
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=10&order=date&key=${apiKey}`
      );
      const data = await response.json();
      console.log("Fetched videos:", data.items);

      const videoPosts = data.items.map((video) => ({
        id: video.id.videoId,
        link: `https://www.youtube.com/watch?v=${video.id.videoId}`,
        title: video.snippet.title,
        content: '',
      }));

      // Merge video posts with existing posts
      setPosts((prevPosts) => [...prevPosts, ...videoPosts]);
    } catch (error) {
      console.error("Error fetching videos:", error);
    }
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const categoryId = 12; // Replace with the actual category ID
        const response = await fetch(
          `http://mau-test.local/wp-json/wp/v2/posts?categories=${categoryId}&per_page=10`
        );
        const data = await response.json();
        console.log("Fetched data:", data);

        const sanitizedPosts = data.map((post) => ({
          id: post.id,
          link: post.link,
          title: post.title.rendered,
          content: cleanHTML(DOMPurify.sanitize(post.content.rendered)),
        }));

        console.log("Fetched posts:", sanitizedPosts);
        console.log("Number of fetched posts:", sanitizedPosts.length); // Log the length

        // Check for duplicate posts only after the initial fetch
        if (!isInitialFetch.current) {
          const uniquePosts = sanitizedPosts.filter(
            (post) => !posts.some((existingPost) => existingPost.content === post.content)
          );

          if (uniquePosts.length > 0) {
            setPosts((prevPosts) => [...prevPosts, ...uniquePosts]);
          }
        } else {
          setPosts(sanitizedPosts);
          isInitialFetch.current = false;
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching posts:", error);
        setLoading(false);
      }
    };

    // Fetch posts only if the fetchTrigger is true
    if (fetchTrigger.current) {
      fetchPosts();
    }
  }, [fetchTrigger, posts]);

  // Initial fetch on component mount
  useEffect(() => {
    if (posts.length === 0 && fetchTrigger.current) {
      fetchTrigger.current = false;
      fetchVideos();
    }
  }, [posts]);

  return (
    <main>
      <Header />
      <div>
        {loading && <p>Loading...</p>}
        <ul className="flex flex-col w-9/12 gap-20 mx-auto">
          {posts.map((post) => (
            <li key={post.id} className="border-black border-2">
              <a href={post.link} target="_blank" rel="noopener noreferrer">
                {post.title}
              </a>
              {post.id && (
                <YouTube
                  videoId={post.id}
                  opts={{
                    playerVars: {
                      color: '8c74b3',
                      controls: 2,
                      theme: 'dark',
                    },
                  }}
                />
              )}
              <div dangerouslySetInnerHTML={{ __html: post.content || 'No content available' }} />
            </li>
          ))}
        </ul>
        <div ref={loaderRef}></div>
      </div>
    </main>
  );
};

export default Home;
