<template>
  <div class="explore-page container py-4">
    <!-- HEADER -->
    <div class="bg-soft rounded-4 p-4 mb-4 text-center shadow-sm">
      <h1 class="display-6 mb-2">🧭 Explore</h1>
      <p class="text-muted mb-0">Track your journeys and tell us what you think.</p>
    </div>

    <!-- TRAVEL TRACKER -->
    <div class="bg-soft rounded-4 p-4 mb-4 shadow-sm">
      <div class="d-flex align-items-center justify-content-between mb-3">
        <h2 class="h4 mb-0">🌍 Travel Tracker</h2>
        <button class="btn btn-sm btn-outline-secondary" @click="resetForm">Clear form</button>
      </div>

      <form class="row g-3" @submit.prevent="addTrip">
        <div class="col-md-4">
          <label class="form-label">Country</label>
          <input v-model="trip.country" type="text" class="form-control" placeholder="e.g., Japan" required />
        </div>
        <div class="col-md-4">
          <label class="form-label">City</label>
          <input v-model="trip.city" type="text" class="form-control" placeholder="e.g., Kyoto" />
        </div>
        <div class="col-md-4">
          <label class="form-label">Transportation</label>
          <select v-model="trip.transport" class="form-select">
            <option value="" disabled>Select</option>
            <option>Plane</option>
            <option>Train</option>
            <option>Bus</option>
            <option>Car</option>
            <option>Boat</option>
          </select>
        </div>

        <div class="col-md-4">
          <label class="form-label">Start Date</label>
          <input v-model="trip.start" type="date" class="form-control" required />
        </div>
        <div class="col-md-4">
          <label class="form-label">End Date</label>
          <input v-model="trip.end" type="date" class="form-control" :min="trip.start" required />
        </div>
        <div class="col-md-4">
          <label class="form-label">Companions</label>
          <input v-model.number="trip.people" type="number" min="1" class="form-control" />
        </div>

        <div class="col-12">
          <label class="form-label">Notes / Highlights</label>
          <textarea v-model="trip.notes" rows="2" class="form-control" placeholder="Sunrise hike, street food tour, hidden gems..."></textarea>
        </div>

        <div class="col-12 d-flex justify-content-between align-items-center">
          <div class="text-muted small">
            <span v-if="durationDays > 0">⏱ Duration: {{ durationDays }} day<span v-if="durationDays>1">s</span></span>
          </div>
          <button class="btn btn-success px-4" :disabled="savingTrip">
            <span v-if="savingTrip" class="spinner-border spinner-border-sm me-2"></span>
            Add Trip
          </button>
        </div>
      </form>

      <!-- Trip List -->
      <hr class="my-4" />
      <div v-if="loadingTrips" class="text-center text-muted py-3">Loading trips...</div>
      <div v-else-if="logs.length" class="row g-3">
        <div v-for="(t, idx) in logs" :key="t._id || t.id" class="col-md-4">
          <div class="card rounded-4 h-100 shadow-sm">
            <div class="card-body d-flex flex-column">
              <div class="d-flex justify-content-between align-items-start">
                <h5 class="card-title mb-1">{{ t.country }} <span v-if="t.city">— {{ t.city }}</span></h5>
                <button class="btn btn-sm btn-outline-danger" @click="removeTrip(t)">Delete</button>
              </div>
              <p class="card-subtitle text-muted small mb-2">
                {{ prettyDate(t.start) }} → {{ prettyDate(t.end) }} · {{ t.transport || '—' }} · 👥 {{ t.people }}
              </p>
              <p class="card-text flex-grow-1" v-if="t.notes">{{ t.notes }}</p>
              <div class="small text-muted">Trip #{{ idx+1 }}</div>
            </div>
          </div>
        </div>
      </div>
      <p v-else class="text-center text-muted mb-0">No trips yet. Log your first adventure! ✨</p>
    </div>

    <!-- FEEDBACK -->
    <div class="bg-soft rounded-4 p-4 shadow-sm">
      <h2 class="h4 mb-3">💬 Feedback</h2>
      <form class="row g-3" @submit.prevent="submitFeedback">
        <div class="col-md-6">
          <label class="form-label">Name (optional)</label>
          <input v-model="feedback.name" type="text" class="form-control" placeholder="Your name" />
        </div>
        <div class="col-md-6">
          <label class="form-label">Rating (1–5)</label>
          <input
            v-model.number="feedback.rating"
            type="number"
            class="form-control"
            min="1"
            max="5"
            placeholder="Enter a rating (1–5)"
          />
        </div>
        <div class="col-12">
          <label class="form-label">Comments</label>
          <textarea v-model="feedback.comment" rows="3" class="form-control" placeholder="What should we improve? What did you like?"></textarea>
        </div>
        <div class="col-12 d-flex justify-content-end">
          <button class="btn btn-primary px-4" :disabled="sendingFeedback">
            <span v-if="sendingFeedback" class="spinner-border spinner-border-sm me-2"></span>
            Send Feedback
          </button>
        </div>
      </form>

      <div v-if="loadingFeedback" class="text-center text-muted py-3">Loading feedback...</div>
      <div v-else-if="feedbacks.length" class="mt-4">
        <h6 class="text-muted">Recent feedback</h6>
        <ul class="list-group rounded-4">
          <li v-for="(f, i) in feedbacks.slice(0,5)" :key="f._id || f.id" class="list-group-item">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <strong>{{ f.name || 'Anonymous' }}</strong>
                <span class="ms-2 text-warning">
                  <font-awesome-icon v-for="r in f.rating" :key="r" :icon="['fas','star']" />
                </span>
                <div class="small text-muted">{{ prettyDateTime(f.createdAt) }}</div>
              </div>
              <span class="text-muted small">#{{ i+1 }}</span>
            </div>
            <div class="mt-1">{{ f.comment }}</div>
          </li>
        </ul>
      </div>
      <p v-else class="text-center text-muted mb-0">No feedback yet — be the first! 🙌</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'

// ----- Travel tracker state -----
const trip = ref({
  country: '',
  city: '',
  transport: '',
  start: '',
  end: '',
  people: 1,
  notes: ''
})

const logs = ref([])
const loadingTrips = ref(true)
const savingTrip = ref(false)

async function loadTrips(){
  loadingTrips.value = true
  try{
    const { data } = await api.get('/travel')
    logs.value = data || []
  }catch(e){
    console.error('Failed to load trips', e)
    logs.value = []
  }finally{
    loadingTrips.value = false
  }
}

const durationDays = computed(() => {
  if (!trip.value.start || !trip.value.end) return 0
  const a = new Date(trip.value.start)
  const b = new Date(trip.value.end)
  const ms = b - a
  return ms > 0 ? Math.ceil(ms / (1000*60*60*24)) : 0
})

async function addTrip(){
  if(!trip.value.country || !trip.value.start || !trip.value.end) return
  savingTrip.value = true
  try{
    await api.post('/travel', trip.value)
    await loadTrips()
    resetForm()
  }catch(e){
    console.error('Add trip failed', e)
  }finally{
    savingTrip.value = false
  }
}

async function removeTrip(t){
  try{
    await api.delete(`/travel/${t._id || t.id}`)
    await loadTrips()
  }catch(e){
    console.error('Delete trip failed', e)
  }
}

function resetForm(){
  trip.value = { country:'', city:'', transport:'', start:'', end:'', people:1, notes:'' }
}

function prettyDate(s){
  if(!s) return ''
  const d = new Date(s)
  return d.toLocaleDateString()
}

function prettyDateTime(s){
  const d = new Date(s)
  return d.toLocaleString()
}

// ----- Feedback state -----
const feedback = ref({ name:'', rating: 5, comment:'' })
const feedbacks = ref([])
const loadingFeedback = ref(true)
const sendingFeedback = ref(false)

async function loadFeedback(){
  loadingFeedback.value = true
  try{
    const { data } = await api.get('/travel/feedback/all')
    feedbacks.value = data || []
  }catch(e){
    console.error('Load feedback failed', e)
    feedbacks.value = []
  }finally{
    loadingFeedback.value = false
  }
}

async function submitFeedback(){
  if(!feedback.value.comment?.trim()) return
  sendingFeedback.value = true
  try{
    await api.post('/travel/feedback', feedback.value)
    feedback.value = { name:'', rating:5, comment:'' }
    await loadFeedback()
    alert('Thanks for the feedback! 🥳')
  }catch(e){
    console.error('Feedback failed', e)
  }finally{
    sendingFeedback.value = false
  }
}

onMounted(() => {
  loadTrips()
  loadFeedback()
})
</script>

<style scoped>
.bg-soft{ background:#BCDFED; }
.cursor-pointer{ cursor:pointer; }
.fa-star{ font-size: 1.1rem; }
.card-title{ font-weight: 600; }
</style>
