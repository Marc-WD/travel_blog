<template>
  <div>
    <!-- Header Section -->
    <div class="container container-grey-background text-center mb-4">
      <h1 class="page-title">📰 Blog Page</h1>
      <p>Welcome to the Blog page. Here you will find various articles and posts.</p>
    </div>

    <!-- Blog Posts Section -->
    <div class="container container-grey-background mt-2">
      <div v-if="loading" class="loading">Loading...</div>
      <div v-else-if="error" class="error">{{ error }}</div>

      <div v-else>
        <div v-if="blogPosts.length > 0" class="row g-4 justify-content-center">
          <div
            v-for="post in blogPosts"
            :key="post._id"
            class="col-md-4 col-sm-6"
          >
            <div class="card h-100 shadow-sm border-0 rounded-4 p-3 bg-white">
              <h5 class="fw-bold text-dark mb-2">{{ post.title }}</h5>
              <p class="text-muted small">{{ truncate(post.content, 120) }}</p>

              <p class="small text-secondary mb-3">
                By <span class="fw-semibold">{{ post.author?.name || 'Unknown' }}</span>
                · {{ formatDate(post.createdAt) }}
              </p>

              <!-- Like & Comment Buttons -->
              <div class="d-flex align-items-center gap-3 mb-3">
                <span @click="toggleLike(post)" class="cursor-pointer">
                  <font-awesome-icon
                    :icon="post.liked ? ['fas', 'heart'] : ['far', 'heart']"
                    :class="post.liked ? 'text-danger' : 'text-secondary'"
                  />
                  <span class="ms-1">{{ post.likes || 0 }}</span>
                </span>

                <span @click="toggleComments(post)" class="cursor-pointer">
                  <font-awesome-icon icon="fa-regular fa-comment" />
                  <span class="ms-1">{{ post.comments?.length || 0 }}</span>
                </span>
              </div>

              <!-- Comments Section -->
              <div v-if="post.showComments" class="mt-2">
                <input
                  v-model="post.newComment"
                  type="text"
                  class="form-control mb-2"
                  placeholder="Add a comment..."
                  @keyup.enter="addComment(post)"
                />
                <div
                  v-for="(c, i) in post.comments"
                  :key="i"
                  class="border rounded px-2 py-1 mb-1 small bg-light"
                >
                  <strong>{{ c.author?.name || 'Anonymous' }}</strong>: {{ c.text }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <p v-else class="text-center text-muted mt-4">No blog posts available.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "@/services/api";

// State
const blogPosts = ref([]);
const loading = ref(true);
const error = ref("");

// Fetch blog posts
const fetchBlogPosts = async () => {
  try {
    const response = await api.get("/posts");
    blogPosts.value = response.data;
  } catch (err) {
    console.error("Error fetching blog posts:", err);
    error.value = "Failed to load blog posts. Please try again later.";
  } finally {
    loading.value = false;
  }
};

// Utility functions
const truncate = (text, len) =>
  text && text.length > len ? text.slice(0, len) + "..." : text || "";

const formatDate = (d) => new Date(d).toLocaleDateString();

const toggleLike = async (post) => {
  try {
    const res = await api.post(`/posts/${post._id}/like`);
    post.liked = !post.liked;
    post.likes = res.data.likes;
  } catch (err) {
    console.error("Like failed:", err);
  }
};

const toggleComments = (post) => {
  post.showComments = !post.showComments;
};

const addComment = async (post) => {
  if (!post.newComment) return;
  try {
    const res = await api.post(`/posts/${post._id}/comment`, {
      text: post.newComment,
    });
    post.comments = res.data.comments;
    post.newComment = "";
  } catch (err) {
    console.error("Comment failed:", err);
  }
};

onMounted(fetchBlogPosts);
</script>

<style scoped>
.container-grey-background {
  background-color: #BCDFED;
  padding: 30px;
  border-radius: 10px;
}

.page-title {
  font-weight: 700;
  color: #1a1a3d;
}

.card {
  transition: all 0.2s ease-in-out;
}
.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.cursor-pointer {
  cursor: pointer;
}
.loading {
  text-align: center;
  font-size: 22px;
  padding: 50px;
}

.error {
  text-align: center;
  color: red;
  font-size: 18px;
  padding: 20px;
}
</style>
