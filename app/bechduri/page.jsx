"use client"
import React, { useState, useEffect, useRef } from "react";
import Header from "../Header";
import DOMPurify from "dompurify";

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
    
          setPosts((prevPosts) => [...prevPosts, ...uniquePosts]);
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
  }, [fetchTrigger]); // Only trigger fetch when fetchTrigger changes

  useEffect(() => {
    // Initial fetch on component mount
    if (posts.length === 0) {
      fetchTrigger.current = true;
    }
  }, [posts]);

  return (
    <main>
      <Header />
      <div>
       
        <ul className="flex flex-col w-9/12 gap-20 mx-auto">
          {posts.map((post) => (
            <li key={post.id} className=' border-black border-2 '>
              <a href={post.link} target="_blank" rel="noopener noreferrer">
                {post.title}
              </a>
              <div dangerouslySetInnerHTML={{ __html: post.content || 'No content available' }} />
            </li>
          ))}
        </ul>
        {loading && <p>Loading...</p>}
        <div ref={loaderRef}></div>
      </div>
    </main>
  );
};

export default Home;
