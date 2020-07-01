import { Request, Response, Router } from 'express';
import { OK } from 'http-status-codes';
import Error from 'src/models/Error';

const router = Router();

interface ErrorObject {
  errorMessage: string;
  errorCode: number;
  errorDescription: string;
  errorUrl: string;
  browser: string;
}

router.post('/send-report', async (req: Request, res: Response) => {
  const errorObject: ErrorObject = req.body.errorObject;

  await Error.create(errorObject);

  return res.json({
    error: 'reported'
  }).status(OK);
});

export default router;
