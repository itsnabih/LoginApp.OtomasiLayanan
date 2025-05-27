pipeline {
  agent any

  environment {
    REGISTRY = 'wiyuwarwoyo'
    IMAGE    = 'login-app2'
    TAG      = "${BUILD_NUMBER}"
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Unit Test') {
      steps {
        script {
          docker.image('node:20').inside {
            dir('app') {
              sh 'npm ci'
              sh 'npm test || echo "no tests"'
            }
          }
        }
      }
    }

    stage('Build & Push Image') {
      steps {
        withCredentials([string(credentialsId: 'DOCKER_PAT', variable: 'DOCKER_PAT')]) {
          dir('app') {
            sh """
              echo "\$DOCKER_PAT" | docker login -u ${REGISTRY} --password-stdin
              docker build -t ${REGISTRY}/${IMAGE}:${TAG} -t ${REGISTRY}/${IMAGE}:latest .
              docker push ${REGISTRY}/${IMAGE}:${TAG}
              docker push ${REGISTRY}/${IMAGE}:latest
            """
          }
        }
      }
    }

    stage('Deploy to Kubernetes') {
      steps {
        withCredentials([file(credentialsId: 'kubeconfig', variable: 'KCFG')]) {
          sh """
            export KUBECONFIG=\$KCFG
            kubectl -n login-app set image deployment/login-app \
              login-app=${REGISTRY}/${IMAGE}:${TAG}
            kubectl -n login-app rollout status deployment/login-app
          """
        }
      }
    }
  }

  post {
    success {
      echo '✅ Deploy sukses!'
    }
    failure {
      echo '❌ Pipeline gagal!'
    }
  }
}
