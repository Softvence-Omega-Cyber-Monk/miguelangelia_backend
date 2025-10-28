import { Router } from 'express';
import authRoute from './app/modules/auth/auth.route';
import userRoute from './app/modules/user/user.route';
import { powerbiRoute } from './app/modules/powerbi/powerbi.route';
import { aiUsageRoutes } from './app/modules/aiSummary/aiSummary.route';


const appRouter = Router();

const moduleRoutes = [
    { path: '/auth', route: authRoute },
    { path: "/user", route: userRoute },
    { path: "/powerbi", route: powerbiRoute },
    { path: "/aiUsage", route: aiUsageRoutes },


];

moduleRoutes.forEach(route => appRouter.use(route.path, route.route));
export default appRouter;