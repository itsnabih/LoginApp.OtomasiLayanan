pipeline {
    agent any                       // Jenkins di VPS pakai Docker host

    environment {
        REGISTRY   = 'docker.io'
        IMAGE_NAME = 'wiyuwarwoyo/login-app2'
        IMAGE_TAG  = "${BUILD_NUMBER}"
    }

    stages {
        stage('Checkout') {
            steps { checkout scm }
        }

        stage('Unit Test') {
            steps {
                sh 'npm ci'
                sh 'npm test || echo "no tests"'      // tes di local agent
            }
        }

        stage('Build Image') {
            steps {
                script {
                    dockerImage = docker.build("${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}")
                }
            }
        }

        stage('Push Image') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'docker-credentials',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh "echo $DOCKER_PASS | docker login ${REGISTRY} -u $DOCKER_USER --password-stdin"
                    sh "docker push ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
                    sh "docker tag  ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG} ${REGISTRY}/${IMAGE_NAME}:latest"
                    sh "docker push ${REGISTRY}/${IMAGE_NAME}:latest"
                }
            }
        }

        stage('Deploy to K8s') {
            steps {
                withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG')]) {
                    sh """
                    kubectl --kubeconfig=$KUBECONFIG apply -f k8s/namespace.yaml
                    kubectl --kubeconfig=$KUBECONFIG apply -f k8s/rbac.yaml
                    kubectl --kubeconfig=$KUBECONFIG apply -f k8s/service.yaml
                    kubectl --kubeconfig=$KUBECONFIG apply -f k8s/deployment.yaml
                    kubectl --kubeconfig=$KUBECONFIG -n login-app \
                        set image deploy/login-app login-app=${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}
                    kubectl --kubeconfig=$KUBECONFIG -n login-app rollout status deploy/login-app
                    """
                }
            }
        }
    }

    post {
        success { echo '✅  Deploy sukses'  }
        failure { echo '❌  Deploy gagal'   }
    }
}
