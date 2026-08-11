import { Request, Response } from 'express';
import { googleSignIn } from '../../../src/controllers/auth-controller';

jest.mock('../../../src/config', () => ({
  JwtAdapter: { generateToken: jest.fn() },
  config: {
    google: { clientId: 'test-client-id.apps.googleusercontent.com' },
    jwt: { session_ttl_hours: 24, nonce_ttl_ms: 300000 },
  },
}));

jest.mock('../../../src/utils/stellar/stellar-verification', () => ({
  stellarVerification: { resolveNetwork: () => 'TESTNET' },
}));

jest.mock('../../../src/utils/auth/google-verification', () => ({
  verifyGoogleIdToken: jest.fn(),
}));

jest.mock('../../../src/db', () => ({
  __esModule: true,
  default: {
    user: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
    session: { create: jest.fn() },
    authNonce: {},
  },
}));

jest.mock('../../../src/utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

// eslint-disable-next-line import/first
import { JwtAdapter, config } from '../../../src/config';
// eslint-disable-next-line import/first
import db from '../../../src/db';
// eslint-disable-next-line import/first
import { verifyGoogleIdToken } from '../../../src/utils/auth/google-verification';

const mockedDb = db as unknown as {
  user: {
    findUnique: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
  };
  session: { create: jest.Mock };
};
const mockedVerify = verifyGoogleIdToken as jest.Mock;
const mockedConfig = config as unknown as {
  google: { clientId: string };
  jwt: { session_ttl_hours: number };
};

function makeRes() {
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
  return res as unknown as Response;
}

function makeReq(): Request {
  return {
    body: { credential: 'jwt' },
    ip: '127.0.0.1',
    headers: { 'user-agent': 'jest' },
  } as unknown as Request;
}

describe('googleSignIn controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedConfig.google.clientId = 'test-client-id.apps.googleusercontent.com';
    (JwtAdapter.generateToken as jest.Mock).mockResolvedValue('jwt-token');
    mockedDb.session.create.mockResolvedValue({ id: 's1' });
    mockedDb.user.findUnique.mockResolvedValue(null);
    mockedDb.user.create.mockImplementation(async (args: any) => ({
      id: 'user-google',
      ...args.data,
    }));
  });

  it('returns 503 when Google sign-in is not configured', async () => {
    mockedConfig.google.clientId = '';
    const res = makeRes();

    await googleSignIn(makeReq(), res);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.stringContaining('not configured') }),
    );
    expect(mockedVerify).not.toHaveBeenCalled();
  });

  it('returns 401 when the ID token fails verification', async () => {
    mockedVerify.mockResolvedValue(null);
    const res = makeRes();

    await googleSignIn(makeReq(), res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid Google credential' });
    expect(mockedDb.user.create).not.toHaveBeenCalled();
  });

  it('creates a new Google user and issues a session', async () => {
    mockedVerify.mockResolvedValue({
      googleId: 'google-sub-123',
      email: 'alice@gmail.com',
      name: 'Alice',
      picture: 'https://example.com/a.png',
    });
    const res = makeRes();

    await googleSignIn(makeReq(), res);

    expect(mockedDb.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          googleId: 'google-sub-123',
          email: 'alice@gmail.com',
          displayName: 'Alice',
          avatarUrl: 'https://example.com/a.png',
        }),
      }),
    );
    expect(mockedDb.session.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: 'user-google',
          walletAddress: null,
        }),
      }),
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ token: 'jwt-token', userId: 'user-google' }),
    );
  });

  it('links the Google identity to an existing email-matched user', async () => {
    mockedVerify.mockResolvedValue({
      googleId: 'google-sub-456',
      email: 'bob@gmail.com',
      name: 'Bob',
      picture: null,
    });
    mockedDb.user.findUnique
      .mockResolvedValueOnce(null) // by googleId
      .mockResolvedValueOnce({ id: 'user-bob', email: 'bob@gmail.com', googleId: null });
    mockedDb.user.update.mockResolvedValue({ id: 'user-bob', googleId: 'google-sub-456' });

    const res = makeRes();

    await googleSignIn(makeReq(), res);

    expect(mockedDb.user.findUnique).toHaveBeenCalledWith({ where: { googleId: 'google-sub-456' } });
    expect(mockedDb.user.findUnique).toHaveBeenCalledWith({ where: { email: 'bob@gmail.com' } });
    expect(mockedDb.user.update).toHaveBeenCalledWith({
      where: { id: 'user-bob' },
      data: { googleId: 'google-sub-456' },
    });
    expect(mockedDb.session.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: 'user-bob' }),
      }),
    );
  });

  it('uses the existing user when the googleId already matches', async () => {
    mockedVerify.mockResolvedValue({
      googleId: 'google-sub-789',
      email: 'carol@gmail.com',
      name: 'Carol',
      picture: null,
    });
    mockedDb.user.findUnique.mockResolvedValueOnce({
      id: 'user-carol',
      googleId: 'google-sub-789',
      email: 'carol@gmail.com',
    });

    const res = makeRes();

    await googleSignIn(makeReq(), res);

    expect(mockedDb.user.create).not.toHaveBeenCalled();
    expect(mockedDb.user.update).not.toHaveBeenCalled();
    expect(mockedDb.session.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: 'user-carol' }),
      }),
    );
  });
});
