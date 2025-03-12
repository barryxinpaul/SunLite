import { useState } from "react";

function Forum() {
  const [selectedCategory, setSelectedCategory] = useState("General Discussions");

  const [posts, setPosts] = useState([
    {
      id: 1,
      category: "General Discussions",
      username: "JohnDoe",
      content: "What are the best beginner stocks to invest in?",
      likes: 3,
      comments: ["Start with ETFs!", "Look into tech stocks!"],
    },
    {
      id: 2,
      category: "Investment Strategies",
      username: "FinanceGal",
      content: "Does anyone use Sunlight's paper trading feature? Thoughts?",
      likes: 5,
      comments: ["Yes! It's a great way to practice.", "I love it!"],
    },
  ]);

  const [newPost, setNewPost] = useState("");
  const [newComment, setNewComment] = useState({});
  
  const addPost = () => {
    if (newPost.trim() !== "") {
      setPosts([
        {
          id: Date.now(),
          category: selectedCategory,
          username: "You",
          content: newPost,
          likes: 0,
          comments: [],
        },
        ...posts,
      ]);
      setNewPost("");
    }
  };

  const addComment = (postId) => {
    if (newComment[postId]?.trim() !== "") {
      setPosts(
        posts.map((post) =>
          post.id === postId
            ? { ...post, comments: [...post.comments, newComment[postId]] }
            : post
        )
      );
      setNewComment({ ...newComment, [postId]: "" });
    }
  };

  const likePost = (postId) => {
    setPosts(
      posts.map((post) =>
        post.id === postId ? { ...post, likes: post.likes + 1 } : post
      )
    );
  };

  return (
    <div className="flex max-w-7xl mx-auto p-6">
      {/* LEFT SIDEBAR - NAVIGATION */}
      <div className="w-1/4 bg-[#E6ECED] p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">📌 Pinned Forums</h2>
        <ul className="space-y-2">
          {[
            "General Discussions",
            "Investment Strategies",
            "Stock Market Trends",
            "Success Stories",
          ].map((category) => (
            <li
              key={category}
              className={`p-2 rounded-lg cursor-pointer transition-all ${

                selectedCategory === category
                  ? "bg-[#436E95] text-white"
                  : "hover:bg-gray-200 hover:text-[#013946]"
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </li>
          ))}
        </ul>
      </div>

      {/* RIGHT SIDE - FORUM CONTENT */}
      <div className="w-3/4 pl-6">
        <h2 className="text-3xl font-bold mb-6">{selectedCategory}</h2>

        {/* New Post Form */}
        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <textarea
            className="w-full p-2 border rounded-lg"
            placeholder={`Start a discussion in ${selectedCategory}...`}
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
          />
          <button
            className="mt-2 px-4 py-2 bg-[#013946] text-white rounded-lg hover:bg-[#436E95]"
            onClick={addPost}
          >
            Post
          </button>
        </div>

        {/* Forum Posts */}
        <div className="space-y-6">
          {posts
            .filter((post) => post.category === selectedCategory)
            .map((post) => (
              <div key={post.id} className="border p-4 rounded-lg shadow">
                <h3 className="font-semibold">@{post.username}</h3>
                <p className="mt-2">{post.content}</p>

                {/* Like & Comment Buttons */}
                <div className="flex items-center mt-4 space-x-4">
                  <button
                    className="text-[#436E95] hover:underline"
                    onClick={() => likePost(post.id)}
                  >
                    👍 {post.likes}
                  </button>
                  <button
                    className="text-[#436E95] hover:underline"
                    onClick={() => setNewComment({ ...newComment, [post.id]: "" })}
                  >
                    💬 {post.comments.length} Comments
                  </button>
                </div>

                {/* Comments Section */}
                {post.comments.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {post.comments.map((comment, index) => (
                      <p key={index} className="border-l-4 border-[#436E95] pl-2">
                        {comment}
                      </p>
                    ))}
                  </div>
                )}

                {/* Add Comment Input */}
                <div className="mt-4">
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg"
                    placeholder="Write a comment..."
                    value={newComment[post.id] || ""}
                    onChange={(e) =>
                      setNewComment({ ...newComment, [post.id]: e.target.value })
                    }
                  />
                  <button
                    className="mt-2 px-4 py-2 bg-[#013946] text-white rounded-lg hover:bg-[#436E95]"
                    onClick={() => addComment(post.id)}
                  >
                    Comment
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default Forum;
