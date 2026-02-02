import { getDefaultConfig } from 'expo/metro-config';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = getDefaultConfig(__dirname);

config.resolver.alias = {
  '@': path.resolve(__dirname, 'client/src'),
  '@shared': path.resolve(__dirname, 'shared'),
};

export default config;
