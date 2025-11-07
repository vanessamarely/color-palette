import { TestBed } from '@angular/core/testing';

import { ColorPalette } from './color-palette';

describe('ColorPalette', () => {
  let service: ColorPalette;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ColorPalette);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
