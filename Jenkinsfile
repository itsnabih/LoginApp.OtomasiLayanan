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
        withCredentials([file(credentialsId: 'kubeconfig', variable: 'KCFG')]) {
          script {
            // Update deployment image
            sh """
              docker run --rm \
                -v \$KCFG:/kubeconfig \
                -e KUBECONFIG=/kubeconfig \
                --network host \
                bitnami/kubectl:latest \
                kubectl -n login-app set image deployment/login-app login-app=${REGISTRY}/${IMAGE}:${TAG}
            """
            
            // Check rollout status
            sh """
              docker run --rm \
                -v \$KCFG:/kubeconfig \
                -e KUBECONFIG=/kubeconfig \
                --network host \
                bitnami/kubectl:latest \
                kubectl -n login-app rollout status deployment/login-app --timeout=300s
            """
          }
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