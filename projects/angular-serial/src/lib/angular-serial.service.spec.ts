import { TestBed } from '@angular/core/testing';

import { AngularSerialService } from './angular-serial.service';
import { AngularSerialTestingModule } from './angular-serial-testing.module';
import { switchMap } from 'rxjs';

describe('AngularSerialService', () => {
  let service: AngularSerialService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AngularSerialTestingModule.forRoot(v => v)],
    });
    service = TestBed.inject(AngularSerialService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should flag service as opened', (done) => {
    service.open().subscribe(() => {
      service.isConnected().subscribe((connected) => {
        expect(connected).toBeTrue();
        done();
      });
    });
  });


  it('should echo back write value on read', (done) => {
    service.open().pipe(
      switchMap(() => service.write('test')),
      switchMap(() => service.read())
    ).subscribe((value) => {
      expect(value).toBe('test');
      service.close();
      done();
    });
  });

  it('should handle undefined Serial', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [AngularSerialTestingModule.forRoot(v => v)],
      providers: [
        { provide: 'Serial', useValue: undefined }
      ]
    });
    service = TestBed.inject(AngularSerialService);
    service.open().subscribe({
      error: (err) => {
        expect(err).toBe('Web serial not supported.');
      }
    });
  });

  it('should handle non-writable port', (done) => {
    const mockSerialPort = {
      open: () => Promise.resolve(),
      close: () => Promise.resolve(),
      readable: new ReadableStream(),
      writable: null
    };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [AngularSerialTestingModule.forRoot(v => v)],
      providers: [
        { provide: 'Serial', useValue: { requestPort: () => Promise.resolve(mockSerialPort) } }
      ]
    });
    service = TestBed.inject(AngularSerialService);
    service.open().subscribe({
      error: (err) => {
        expect(err).toBe('Port is not readable or writable.');
        done();
      }
    });
  });

  it('should handle non-readable and non-writable port', (done) => {
    const mockSerialPort = {
      open: () => Promise.resolve(),
      close: () => Promise.resolve(),
      readable: null,
      writable: null
    };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [AngularSerialTestingModule.forRoot(v => v)],
      providers: [
        { provide: 'Serial', useValue: { requestPort: () => Promise.resolve(mockSerialPort) } }
      ]
    });
    service = TestBed.inject(AngularSerialService);
    service.open().subscribe({
      error: (err) => {
        expect(err).toBe('Port is not readable or writable.');
        done();
      }
    });
  });


});
