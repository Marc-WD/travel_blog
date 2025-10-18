<template>
  <div class="comments-section">
    <h3>Comments</h3>
    <div v-for="comment in comments" :key="comment._id" class="comment">
      <p><strong>{{ comment.author }}</strong>: {{ comment.text }}</p>
      <small>{{ new Date(comment.createdAt).toLocaleString() }}</small>
    </div>

    <div class="add-comment">
      <input v-model="author" placeholder="Your name" />
      <textarea v-model="newComment" placeholder="Add a comment..."></textarea>
      <button @click="addComment">Post</button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  props: ['postId'],
  data() {
    return {
      comments: [],
      newComment: '',
      author: '',
    };
  },
  mounted() {
    this.fetchComments();
  },
  methods: {
    async fetchComments() {
      try {
        const res = await axios.get(`http://localhost:5000/api/posts/${this.postId}/comments`);
        this.comments = res.data;
      } catch (err) {
        console.error('Failed to load comments:', err);
      }
    },
    async addComment() {
      if (!this.newComment.trim()) return;
      try {
        const res = await axios.post(`http://localhost:5000/api/posts/${this.postId}/comments`, {
          author: this.author || 'Anonymous',
          text: this.newComment,
        });
        this.comments.push(res.data);
        this.newComment = '';
      } catch (err) {
        console.error('Error posting comment:', err);
      }
    },
  },
};
</script>

<style scoped>
.comments-section {
  margin-top: 1rem;
}
.comment {
  padding: 0.5rem 0;
  border-bottom: 1px solid #ddd;
}
.add-comment {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>
