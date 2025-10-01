import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
          <div className="card p-8 max-w-md text-center">
            <div className="text-red-400 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-white mb-2">Что-то пошло не так</h2>
            <p className="text-gray-400 mb-4">
              Произошла ошибка при отображении этой страницы.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Перезагрузить страницу
            </button>
            <details className="mt-4 text-left text-sm text-gray-400">
              <summary>Подробности ошибки</summary>
              <pre className="mt-2 whitespace-pre-wrap">
                {this.state.error && this.state.error.toString()}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;