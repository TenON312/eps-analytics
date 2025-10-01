// src/components/ui/ErrorBoundary.jsx
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render shows the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
          <h2 className="text-lg font-semibold text-white mb-2">Something went wrong.</h2>
          <details className="text-sm text-gray-300">
            {this.state.error && this.state.error.toString()}
            <br />
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;