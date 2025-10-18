<template>
  <div class="user-admin-details container mt-5">
    <!-- USER DETAILS CARD -->
    <div class="card shadow-lg p-4 border-0 rounded-4 mb-5">
      <h3 class="text-center mb-3">👤 User Profile</h3>
      <hr />
      <p><strong>Name:</strong> {{ user?.name }}</p>
      <p><strong>Email:</strong> {{ user?.email }}</p>
      <p><strong>Role:</strong> {{ user?.role }}</p>

      <div class="text-center mt-4">
        <button class="btn btn-danger" @click="logoutUser">Logout</button>
      </div>
    </div>

    <!-- ADD NEW BLOG POST -->
    <div class="card shadow p-4 border-0 rounded-4 mb-5">
      <h4 class="mb-3 text-center">✍️ Add a New Blog Post</h4>
      <form @submit.prevent="handleAddPost">
        <input
          v-model="newPost.title"
          type="text"
          placeholder="Blog title"
          class="form-control mb-3"
          required
        />
        <textarea
          v-model="newPost.content"
          placeholder="Write something inspiring..."
          class="form-control mb-3"
          rows="4"
          required
        ></textarea>
        <button class="btn btn-success w-100">Publish Post</button>
      </form>
    </div>

    <!-- MY BLOG POSTS -->
    <h3 class="text-center mb-4">📰 My Blog Posts</h3>

    <div v-if="posts.length > 0" class="row g-4">
      <div v-for="post in posts" :key="post._id" class="col-md-4">
        <div class="card blog-card shadow-sm border-0">
          <div class="card-body">
            <h5 class="card-title">{{ post.title }}</h5>
            <p class="card-text text-muted">{{ truncate(post.content, 120) }}</p>
            <p class="small text-secondary">{{ formatDate(post.createdAt) }}</p>

            <!-- ACTIONS -->
            <div class="d-flex justify-content-between align-items-center">
<div class="d-flex gap-3 align-items-center">
  <span @click="toggleLike(post)" class="cursor-pointer d-flex align-items-center gap-1">
    <font-awesome-icon
      :icon="post.liked ? ['fas', 'heart'] : ['far', 'heart']"
      :class="post.liked ? 'text-danger like-icon' : 'text-muted like-icon'"
    />
    <small>{{ post.likes || 0 }}</small>
  </span>

  <span @click="toggleComments(post)" class="cursor-pointer d-flex align-items-center gap-1">
    <font-awesome-icon :icon="['far', 'comment']" class="text-muted comment-icon" />
    <small>{{ post.comments?.length || 0 }}</small>
  </span>
</div>

              <div class="d-flex gap-2">
                <button class="btn btn-sm btn-outline-primary" @click="startEdit(post)">Edit</button>
                <button class="btn btn-sm btn-outline-danger" @click="deletePost(post._id)">Delete</button>
              </div>
            </div>

            <!-- COMMENTS SECTION -->
            <div v-if="post.showComments" class="mt-3">
              <div class="mb-2">
                <input
                  v-model="post.newComment"
                  type="text"
                  class="form-control"
                  placeholder="Add a comment..."
                  @keyup.enter="addComment(post)"
                />
              </div>
              <div
                v-for="(c, i) in post.comments"
                :key="i"
                class="border rounded px-2 py-1 mb-2 small bg-light"
              >
                <strong>{{ c.author }}</strong>: {{ c.text }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center text-muted py-5">
      You haven’t written any blogs yet. Share your travel stories!
    </div>

    <!-- EDIT MODAL -->
    <div v-if="editMode" class="modal-backdrop">
      <div class="modal-box">
        <h5>Edit Blog Post</h5>
        <input v-model="editPost.title" class="form-control mb-2" placeholder="Title" />
        <textarea v-model="editPost.content" class="form-control mb-3" rows="5"></textarea>
        <div class="d-flex justify-content-end gap-2">
          <button class="btn btn-secondary" @click="cancelEdit">Cancel</button>
          <button class="btn btn-success" @click="updatePost">Save</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import api from '@/services/api';
import { useAuth } from '@/stores/auth';
import { useRouter } from 'vue-router';

export default {
  name: 'UserAdminDetails',
  setup() {
    const { logout } = useAuth();
    const router = useRouter();
    const user = ref(null);
    const posts = ref([]);
    const newPost = ref({ title: '', content: '' });
    const editMode = ref(false);
    const editPost = ref({});

    const fetchUser = async () => {
      try {
        const res = await api.get('/auth/me');
        user.value = res.data;
        await fetchPosts();
      } catch (err) {
        console.error('User fetch failed', err);
      }
    };

    const fetchPosts = async () => {
      const res = await api.get('/posts/mine');
      posts.value = res.data.map((p) => ({
        ...p,
        liked: false,
        showComments: false,
        newComment: '',
      }));
    };

    const handleAddPost = async () => {
      if (!newPost.value.title || !newPost.value.content) {
        alert('Please fill all fields!');
        return;
      }

      try {
        const res = await api.post('/posts', {
          title: newPost.value.title.trim(),
          content: newPost.value.content.trim(),
        });

        posts.value.unshift({
          ...res.data,
          liked: false,
          showComments: false,
          newComment: '',
        });

        newPost.value = { title: '', content: '' };
        alert('✅ Post published successfully!');
      } catch (err) {
        console.error('❌ Failed to publish post:', err);
        alert('❌ Failed to publish post. Please check backend logs.');
      }
    };

    const startEdit = (post) => {
      editMode.value = true;
      editPost.value = { ...post };
    };

    const cancelEdit = () => (editMode.value = false);

    const updatePost = async () => {
      const res = await api.put(`/posts/${editPost.value._id}`, {
        title: editPost.value.title,
        content: editPost.value.content,
      });
      const idx = posts.value.findIndex((p) => p._id === editPost.value._id);
      if (idx !== -1)
        posts.value[idx] = {
          ...res.data,
          liked: posts.value[idx].liked,
          showComments: posts.value[idx].showComments,
          newComment: '',
        };
      editMode.value = false;
    };

    const deletePost = async (id) => {
      await api.delete(`/posts/${id}`);
      posts.value = posts.value.filter((p) => p._id !== id);
    };

    const toggleLike = async (post) => {
      const res = await api.post(`/posts/${post._id}/like`);
      post.liked = !post.liked;
      post.likes = res.data.likes;
    };

    const toggleComments = (post) => {
      post.showComments = !post.showComments;
    };

    const addComment = async (post) => {
      if (!post.newComment) return;
      const res = await api.post(`/posts/${post._id}/comment`, {
        text: post.newComment,
      });
      post.comments = res.data.comments;
      post.newComment = '';
    };

    const logoutUser = () => {
      logout();
      router.push('/sign-in');
    };

    const truncate = (text, len) =>
      text && text.length > len ? text.slice(0, len) + '...' : text || '';

    const formatDate = (d) => new Date(d).toLocaleDateString();

    onMounted(fetchUser);

    return {
      user,
      posts,
      newPost,
      editMode,
      editPost,
      handleAddPost,
      startEdit,
      cancelEdit,
      updatePost,
      deletePost,
      toggleLike,
      toggleComments,
      addComment,
      logoutUser,
      truncate,
      formatDate,
    };
  },
};
</script>



<style scoped>
.blog-card {
  transition: all 0.2s ease;
  border-radius: 12px;
  overflow: hidden;
  background-color: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  height: auto; /* no fixed height */
  padding: 1rem;
}

.card-body {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  height: auto;
}

.blog-img {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 12px;
  margin-bottom: 1rem;
}

.col-md-4 {
  display: flex;
  justify-content: center;
  align-items: stretch;
}

/* ✅ Tighter grid, more natural card sizing */
.row.g-4 {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  justify-content: center;
}

.col-md-4 {
  flex: 0 0 300px;
  max-width: 300px;
}

/* ✅ Responsive adjustments */
@media (max-width: 768px) {
  .col-md-4 {
    flex: 0 0 90%;
    max-width: 90%;
  }
}
</style>

