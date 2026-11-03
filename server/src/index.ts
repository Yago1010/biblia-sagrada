import { createApp } from './app';
import { DATA_DIR } from './data';

const port = Number(process.env.PORT ?? 4000);

createApp().listen(port, () => {
  console.log(`[biblia] api em http://localhost:${port}/api`);
  console.log(`[biblia] dados locais em ${DATA_DIR}`);
});
