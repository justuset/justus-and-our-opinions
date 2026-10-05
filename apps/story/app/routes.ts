import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [index('routes/home.tsx'), route('photo-essay', 'routes/photo-essay.tsx')] satisfies RouteConfig;
