import firebase from 'firebase/compat/app'

import Task from './task_help'


export default {
    state: {
        tasks: [
            {
              'id': 1,
              'title': 'WOW',
              'description': 'Lorem ipsum dolor sit amet consectatur',
              'whatWatch': 'Film',
              'completed': true,
              'editing': false
            },
            {
              'id': 2,
              'title': 'AAA',
              'description': 'Lorem ipsum dolor sit amet consectatur',
              'whatWatch': 'Serial',
              'completed': true,
              'editing': false
            }
          ]
    },
    mutations: {
      loadTasks (state, payload) {
        state.tasks = payload
      },
      newTask (state, payload) {
        state.tasks.push(payload)
      },
      editTask (state, {id, title, description}) {
        const task = state.tasks.find(t => {
          return t.id === id
        })
        task.title = title
        task.description = description
      }
    },
    actions: {
    // Load all Tasks
    async loadTasks ({commit}) {
      commit('clearError')
      commit('setLoading', true)
      try {
        // Get task
        const task = await firebase.database().ref('tasks').once('value')
        // Get value
        const tasks = task.val()
        // New array
        const tasksArray = []
        // Get task key (id)
        Object.keys(tasks).forEach(key => {
          const t = tasks[key]
          tasksArray.push(
            new Task(
              t.title,
              t.description,
              t.whatWatch,
              t.time,
              t.tags,
              t.completed,
              t.editing,
              t.user,
              key
            )
          )
        })
        // Send mutation
        commit('loadTasks', tasksArray)

        commit('setLoading', false)
      } catch (error) {
        commit('setLoading', false)
        commit('setError', error.message)
        throw error
      }
    },      
      // Load all Tasks
      async loadTasks ({commit}, payload) {
        commit('clearError')
        commit('setLoading', true)
        try {
          // Get task
          const task = await firebase.database().ref('tasks').once('value')
          // Get value
          const tasks = task.val()
          // New array
          const tasksArray = []
          // Get task key (id)
          Object.keys(tasks).forEach(key => {
            const t = tasks[key]
            tasksArray.push(
              new Task(
                t.title,
                t.description,
                t.whatWatch,
                t.time,
                t.tags,
                t.completed,
                t.editing,
                t.user,
                key
              )
            )
          })
          // Send mutation
          commit('loadTasks', tasksArray)

          commit('setLoading', false)
        } catch (error) {
          commit('setLoading', false)
          commit('setError', error.message)
          throw error
        }
      },
      // Create new Task
      async newTask ({commit, getters}, payload) {
        commit('clearError')
        commit('setLoading', true)
        try {
          const newTask = new Task(
            payload.title,
            payload.description,
            payload.whatWatch,
            payload.time,
            payload.tags,
            payload.completed,
            payload.editing,
            getters.user.id
          )
          const task = await firebase.database().ref('tasks').push(newTask)
          console.log(tasks)
          commit('newTask', {
            ...newTask,
            id: task.key
          })
          commit('newTask', payload)
          commit('setLoading', false)            
        } catch (error) {
          commit('setLoading', false)
          commit('setError', error.message)
          throw error
        }
      },
          // Edit Task (popup)
      async editTask ({commit}, {id, title, description}) {
        commit('clearError')
        commit('setLoading', true)
        try {
          // Update title & descr
          await firebase.database().ref('tasks').child(id).update({
            title,
            description
          })
          // Send mutation
          commit('editTask', {id, title, description})

          commit('setLoading', false)
        } catch (error) {
          commit('setLoading', false)
          commit('setError', error.message)
          throw error
        }
      },
      // Delete Task (button)
      async deleteTask ({commit}, id) {
        commit('clearError')
        commit('setLoading', true)
        try {
          await firebase.database().ref('tasks').child(id).remove()
  
          commit('setLoading', false)
        } catch (error) {
          commit('setLoading', false)
          commit('setError', error.message)
          throw error
        }
      }
    },
    getters: {
      // Get All user Tasks
      tasks (state, getters) {
        return state.tasks.filter(task => {
          return task.user === getters.user.id
        })
      },
      // Get user Completed Tasks
      taskCompleted (state, getters) {
        return getters.tasks.filter(task => {
          return task.completed
        })
      },
      // Get user Active Tasks
      taskNotCompleted (state, getters) {
        return getters.tasks.filter(task => {
          return task.completed === false
        })
      }
    }
  }