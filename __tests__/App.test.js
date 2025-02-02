/**
 * @format
 */

import 'react-native';
import React from 'react';
import App from '../App';

// Jest imports for testing
import { it } from '@jest/globals';

// Test renderer must be required after react-native.
import renderer from 'react-test-renderer';

it('renders correctly', () => {
  renderer.create(<App />);
});
