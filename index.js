Vue.component('search-field', {
  props: ['searchText'],
  template: `
    <input type="text" class="search-field" @input="$emit('searchTextChange', $event)" :value="searchText" placeholder="Search notes..." />
  `
});

Vue.component('select-button', {
  template: `
    <button class="select-button" @click="$emit('selectClick')">Select Notes for Deletion</button>
  `
});

Vue.component('cancel-button', {
  template: `
    <button class="cancel-selection-button" @click="$emit('cancelClick')">Cancel Selection</button>
  `
});

Vue.component('delete-button', {
  template: `
    <button class="delete-selected-button" @click="$emit('deleteClick')">Delete Selected</button>
  `
});

Vue.component('note', {
  props: [
    'id',
    'title',
    'content',
    'selected'
  ],
  methods: {
    handleNoteClick(e) {
      this.$emit('noteClick', this.id, this.title, this.content);
    }
  },
  template: `
    <div class="note" :class="{selected: selected}" @click="handleNoteClick">
      <h2 class="noteTitle">{{title}}</h2>
      <p class="noteContent">{{content}}</p>
    </div>
  `
});

Vue.component('notes', {
  props: ['savedNotes', 'selectedNoteIds', 'searchText'],
  computed: {
    filteredNotes: function() {
      let returnedNotes = [];
      this.savedNotes.forEach(savedNote => {
        let noteTitleLower = savedNote.title.toLowerCase();
        let noteContentLower = savedNote.content.toLowerCase();
        let searchTextLower = this.searchText.toLowerCase();
        if(noteTitleLower.includes(searchTextLower) || noteContentLower.includes(searchTextLower)) {
          returnedNotes.push(savedNote);
        } else {
          return;
        }
      });
      return returnedNotes;
    }
  },
  template: `
    <div class="notes">
      <note v-for="filteredNote in filteredNotes"
        :key="filteredNote.id"
        :id="filteredNote.id"
        :title="filteredNote.title"
        :content="filteredNote.content"
        :selected="selectedNoteIds.includes(filteredNote.id)"
        @noteClick="$emit('noteClick', ...arguments)"
      />
    </div>
  `
});

Vue.component('modal', {
  props: ['modalId'],
  methods: {
    handleCloseClick(e) {
      this.$emit('closeClick');
    },
    handleBackdropClick(e) {
      if(e.target === document.getElementById(this.modalId)) {
        this.handleCloseClick(e);
      }
    }
  },
  template: `
    <div class="modal-backdrop" :id="modalId" @click="handleBackdropClick">
      <div class="modal-box">
        <button class="modal-close-button modal-button" @click="handleCloseClick">&times;</button>
        <slot></slot>
      </div>
    </div>
  `
})

Vue.component('create-note-modal', {
  props: ['title', 'content'],
  template: `
    <modal modalId="create-note-modal" @closeClick="$emit('closeClick')">
      <input type="text" :value="title" @input="$emit('titleChange', $event)" placeholder="Title..." />
      <textarea :value="content" @input="$emit('contentChange', $event)" placeholder="Note..." rows="15" />
      <div class="note-buttons">
        <button class="note-discard-button modal-button" @click="$emit('discardClick')">Discard</button>
        <button class="note-save-button modal-button" @click="$emit('saveClick')">Save</button>
      </div>
    </modal>
  `
})

Vue.component('view-note-modal', {
  props: ['title', 'content'],
  template: `
    <modal modalId="view-note-modal" @closeClick="$emit('closeClick')">
      <h2 class="noteTitle">{{title}}</h2>
      <p class="noteContent">{{content}}</p>
      <div class="note-buttons">
        <button class="note-delete-button modal-button" @click="$emit('deleteClick')">Delete</button>
        <button class="note-edit-button modal-button" @click="$emit('editClick')">Edit</button>
      </div>
    </modal>
  `
})

Vue.component('edit-note-modal', {
  props: ['title', 'content'],
  template: `
    <modal modalId="edit-note-modal" @closeClick="$emit('closeClick')">
      <input type="text" :value="title" @input="$emit('titleChange', $event)" placeholder="Title..." />
      <textarea :value="content" @input="$emit('contentChange', $event)" placeholder="Note..." rows="15" />
      <div class="note-buttons">
        <button class="note-discard-button modal-button" @click="$emit('discardClick')">Discard</button>
        <button class="note-save-button modal-button" @click="$emit('saveClick')">Save</button>
      </div>
    </modal>
    `
});

Vue.component('notes-app', {
  props: ['predefinedNotes'],
  data: function() {
    return {
      searchText: '',
      savedNotes: [],
      currentNote: {
        id: undefined,
        title: '',
        content: ''
      },
      unsavedNote: {
        title: '',
        content: ''
      },
      selectionMode: false,
      selectedNoteIds: [],
      createModalShown: false,
      viewModalShown: false,
      editModalShown: false
    }
  },
  methods: {
    handleSearchTextChange(e) {
      this.searchText = e.target.value;
    },
    handleSelectClick() {
      this.selectionMode = true;
    },
    handleCancelClick() {
      this.selectedNoteIds = [];
      this.selectionMode = false;
    },
    handleDeleteClick() {
      this.savedNotes = this.savedNotes.filter(savedNote => !this.selectedNoteIds.includes(savedNote.id));
      this.$nextTick(function() {
        localStorage.setItem('savedNotes', JSON.stringify(this.savedNotes));
      })
      this.selectedNoteIds = [];
      this.selectionMode = false;
    },
    handleCreateClick() {
      this.createModalShown = true;
    },
    handleNoteClick(clickedNoteId, clickedNoteTitle, clickedNoteContent) {
      if(!this.selectionMode) {
        this.currentNote = {
          id: clickedNoteId,
          title: clickedNoteTitle,
          content: clickedNoteContent
        };
        this.viewModalShown = true;
      } else {
        if(!this.selectedNoteIds.includes(clickedNoteId)) {
          this.selectedNoteIds = this.selectedNoteIds.concat([clickedNoteId]);
        } else {
          this.selectedNoteIds = this.selectedNoteIds.filter(selectedNoteId => selectedNoteId !== clickedNoteId);
        }
      }
    },
    handleCreateTitleChange(e) {
      this.unsavedNote = {
        title: e.target.value,
        content: this.unsavedNote.content
      };
    },
    handleCreateContentChange(e) {
      this.unsavedNote = {
        title: this.unsavedNote.title,
        content: e.target.value
      };
    },
    handleCreateDiscardClick() {
      this.unsavedNote = {
        title: '',
        content: ''
      };
      this.createModalShown = false;
    },
    handleCreateSaveClick() {
      let lastSavedNote = this.savedNotes[this.savedNotes.length - 1];
      this.savedNotes = this.savedNotes.concat([{
        id: lastSavedNote.id + 1,
        title: this.unsavedNote.title,
        content: this.unsavedNote.content
      }]);
      this.$nextTick(function() {
        localStorage.setItem('savedNotes', JSON.stringify(this.savedNotes));
      })
      this.unsavedNote = {
        title: '',
        content: ''
      };
      this.createModalShown = false;
    },
    handleCreateCloseClick() {
      this.createModalShown = false;
    },
    handleViewDeleteClick() {
      this.savedNotes = this.savedNotes.filter(savedNote => savedNote.id !== this.currentNote.id);
      this.$nextTick(function() {
        localStorage.setItem('savedNotes', JSON.stringify(this.savedNotes));
      });
      this.viewModalShown = false;
    },
    handleViewEditClick() {
      this.unsavedNote = this.currentNote;
      this.viewModalShown = false;
      this.editModalShown = true;
    },
    handleViewCloseClick(e) {
      this.viewModalShown = false;
    },
    handleEditTitleChange(e) {
      this.unsavedNote = {
        title: e.target.value,
        content: this.unsavedNote.content
      };
    },
    handleEditContentChange(e) {
      this.unsavedNote = {
        title: this.unsavedNote.title,
        content: e.target.value
      };
    },
    handleEditDiscardClick() {
      this.unsavedNote = {
        title: '',
        content: ''
      };
      this.viewModalShown = true;
      this.editModalShown = false;
    },
    handleEditSaveClick() {
      this.savedNotes = this.savedNotes.map(savedNote => {
        if (savedNote.id === this.currentNote.id) {
          return Object.assign({}, this.currentNote, this.unsavedNote);
        } else {
          return savedNote;
        }
      });
      this.$nextTick(function() {
        localStorage.setItem('savedNotes', JSON.stringify(this.savedNotes));
      });
      this.currentNote = Object.assign(this.currentNote, this.unsavedNote);
      this.unsavedNote = {
        title: '',
        content: ''
      };
      this.viewModalShown = true;
      this.editModalShown = false;
    },
    handleEditCloseClick() {
      this.handleEditDiscardClick();
    }
  },
  created: function() {
    if(!localStorage.length) {
      this.savedNotes = this.predefinedNotes;
    } else {
      this.savedNotes = JSON.parse(localStorage.getItem('savedNotes'));
    }
  },
  template: `
    <div class="notes-app">
      <h1 class="notes-app-heading">Notes</h1>
      <div class="notes-controls">
        <search-field :searchText="searchText" @searchTextChange="handleSearchTextChange($event)" />
        <div class="notes-button-controls">
          <select-button v-if="!selectionMode" @selectClick="handleSelectClick" />
          <cancel-button v-if="selectionMode" @cancelClick="handleCancelClick" />
          <delete-button v-if="selectionMode" @deleteClick="handleDeleteClick" />
          <button class="create-note-button" @click="handleCreateClick">+</button>
        </div>
      </div>
      <notes
        :savedNotes="savedNotes"
        :selectedNoteIds="selectedNoteIds"
        :searchText="searchText"
        @noteClick="handleNoteClick"
      />
      <create-note-modal
        v-if="createModalShown"
        :title="unsavedNote.title"
        :content="unsavedNote.content"
        @closeClick="handleCreateCloseClick"
        @titleChange="handleCreateTitleChange"
        @contentChange="handleCreateContentChange"
        @discardClick="handleCreateDiscardClick"
        @saveClick="handleCreateSaveClick"
      />
      <view-note-modal
        v-if="viewModalShown"
        :title="currentNote.title"
        :content="currentNote.content"
        @closeClick="handleViewCloseClick"
        @deleteClick="handleViewDeleteClick"
        @editClick="handleViewEditClick"
      />
      <edit-note-modal
        v-if="editModalShown"
        :title="unsavedNote.title"
        :content="unsavedNote.content"
        @closeClick="handleEditCloseClick"
        @titleChange="handleEditTitleChange"
        @contentChange="handleEditContentChange"
        @discardClick="handleEditDiscardClick"
        @saveClick="handleEditSaveClick"
      />
    </div>
  `
});

new Vue({
  el: '#root',
  data: {
    predefinedNotes: [
      {id: 1, title: "ToDo List", content: "write a React SPA\ndo laundary\nget new headphones"},
      {id: 2, title: "Technologies to keep an eye on", content: "AI\nQuantum Computing"},
      {id: 3, title: "Favourite Colors", content: "Alice:\nblue\nwhite\n\nBob:\ngreen\n\nCammy:\nred\ngreen"},
      {id: 4, title: "Journal", content: "2020-02-10:\nFinally beat the mobile game I downloaded last week. It's time to do some actual work :D\n\n2020-04-08:\nFinally have a functional version of my first game developed! Time to share it with my family and friends :D"},
      {id: 5, title: "Reading List", content: "Harry Potter series\nThe Hobbit\nLord of the Rings series"}
    ]
  },
  template: `
    <notes-app :predefinedNotes="predefinedNotes"></notes-app>
  `
});
