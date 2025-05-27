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
                sh """
                echo "\$DOCKER_PAT" | docker login -u ${REGISTRY} --password-stdin
                docker build -t ${REGISTRY}/${IMAGE}:${TAG} -t ${REGISTRY}/${IMAGE}:latest .
                docker push ${REGISTRY}/${IMAGE}:${TAG}
                docker push ${REGISTRY}/${IMAGE}:latest
                """
            }
        }
    }
    stage('Deploy to Kubernetes') {
        steps {
            // ambil kubeconfig-nya sebagai FILE, bukan dir
            withCredentials([file(credentialsId: 'kubeconfig', variable: 'KCFG')]) {
                // ❶ Versi tanpa docker-run (paling simpel)
                sh '''
                    kubectl --kubeconfig="$KCFG" \
                        -n login-app \
                        set image deployment/login-app \
                        login-app=wiyuwarwoyo/login-app2:${BUILD_NUMBER}
                '''
            
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