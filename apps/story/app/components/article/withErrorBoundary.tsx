// withErrorBoundary: the reference wraps every block in an error boundary, so one broken block disappears instead of
// taking the article down with it. React only has class-based boundaries (getDerivedStateFromError), so this is one.
//
// Boundaries catch errors while rendering IN THE BROWSER. On the server, an error thrown during render fails the
// request, which is why the route's loader checks the doc first (docProblems) and refuses to render a bad one.
import { Component, type ComponentType, type ReactNode } from 'react';

interface Props {
  name: string;
  children: ReactNode;
}

export class ErrorBoundary extends Component<Props, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error(`[${this.props.name}] block failed and was removed:`, error);
  }

  render() {
    if (!this.state.error) return this.props.children;
    // In dev, say which block broke. In production, the block is simply gone.
    return import.meta.env.DEV ? (
      <p role="alert" data-block-error={this.props.name}>
        {this.props.name} failed: {this.state.error.message}
      </p>
    ) : null;
  }
}

export function withErrorBoundary<P extends object>(
  Wrapped: ComponentType<P>,
  name = Wrapped.displayName ?? Wrapped.name,
) {
  function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary name={name}>
        <Wrapped {...props} />
      </ErrorBoundary>
    );
  }
  WithErrorBoundary.displayName = `withErrorBoundary(${name})`;
  return WithErrorBoundary;
}
