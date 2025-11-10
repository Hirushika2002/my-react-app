pipeline {
  agent any

  environment {
    DOCKER_USER = 'hirushika2002'
    FRONTEND_IMAGE = "${DOCKER_USER}/smartstays-frontend"
    BACKEND_IMAGE  = "${DOCKER_USER}/smartstays-backend"
    GIT_COMMIT_SHORT = "${env.GIT_COMMIT?.take(7)}"
  }

  tools {
    nodejs 'node22'
  }

  options {
    timestamps()
    ansiColor('xterm')
    buildDiscarder(logRotator(numToKeepStr: '15'))
  }

  triggers {
    // Polling fallback; replace with GitHub webhook later
    pollSCM('H/10 * * * *')
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Frontend: Install & Build') {
      steps {
        dir('frontend') {
          sh 'npm ci || npm install'
          sh 'npm run build'
        }
      }
      post {
        success {
          archiveArtifacts artifacts: 'frontend/dist/**', fingerprint: true
        }
      }
    }

    stage('Backend: Install') {
      steps {
        dir('backend') {
          sh 'npm ci || npm install'
        }
      }
    }

    stage('Tests') {
      parallel {
        stage('Frontend Tests') {
          when { expression { fileExists('frontend/package.json') } }
          steps {
            dir('frontend') { sh 'npm test -- --watchAll=false || true' }
          }
        }
        stage('Backend Tests') {
          when { expression { fileExists('backend/package.json') } }
          steps {
            dir('backend') { sh 'npm test || true' }
          }
        }
      }
    }

    stage('Docker Build') {
      steps {
        script {
          sh '''
            docker build \
              --label org.opencontainers.image.source=https://github.com/Hirushika2002/my-react-app \
              --label org.opencontainers.image.revision=${GIT_COMMIT} \
              -t ${FRONTEND_IMAGE}:latest ./frontend
            docker build \
              --label org.opencontainers.image.source=https://github.com/Hirushika2002/my-react-app \
              --label org.opencontainers.image.revision=${GIT_COMMIT} \
              -t ${BACKEND_IMAGE}:latest ./backend
          '''
        }
      }
    }

    stage('Docker Tag Commit') {
      when { expression { env.GIT_COMMIT_SHORT } }
      steps {
        sh 'docker tag ${FRONTEND_IMAGE}:latest ${FRONTEND_IMAGE}:${GIT_COMMIT_SHORT}'
        sh 'docker tag ${BACKEND_IMAGE}:latest ${BACKEND_IMAGE}:${GIT_COMMIT_SHORT}'
      }
    }

    stage('Docker Push') {
      when { branch 'main' }
      steps {
        withCredentials([usernamePassword(credentialsId: 'dockerhub', usernameVariable: 'DUSER', passwordVariable: 'DPASS')]) {
          sh 'echo $DPASS | docker login -u $DUSER --password-stdin'
          sh 'docker push ${FRONTEND_IMAGE}:latest'
          sh 'docker push ${BACKEND_IMAGE}:latest'
          sh '''
            if [ -n "${GIT_COMMIT_SHORT}" ]; then
              docker push ${FRONTEND_IMAGE}:${GIT_COMMIT_SHORT}
              docker push ${BACKEND_IMAGE}:${GIT_COMMIT_SHORT}
            fi
          '''
        }
      }
    }
  }

  post {
    always { echo "Result: ${currentBuild.currentResult}" }
    success { echo 'Pipeline SUCCESS' }
    failure { echo 'Pipeline FAILED' }
    cleanup { sh 'docker logout || true' }
  }
}
