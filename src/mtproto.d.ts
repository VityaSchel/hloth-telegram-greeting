// Type definitions for @mtproto/core
// Project: https://github.com/alik0211/mtproto-core
// Definitions by: Viktor Shchelochkov <hi@hloth.dev> (https://hloth.dev/), Ali Gasymov <https://www.gasymov.com/>

declare class MyAsyncLocalStorage {
  setItem(key: string, value: string): Promise<void>;
  getItem(key: string): Promise<string|null>;
}

declare module '@mtproto/core' {
  export default class MTProto {
    constructor(options: {
      api_id: number,
      api_hash: string,
      test?: boolean,
      customLocalStorage?: MyAsyncLocalStorage,
      storageOptions?: {
        path: string;
      };
    });

    call(method: string, params?: object, options?: {
      dcId?: number,
      syncAuth?: boolean,
    }): Promise<object>;
    call(method: 'account.getPassword'): Promise<{ srp_id: number | string, current_algo: account_Password, srp_B: bytes }>;
    call(method: 'auth.signIn'): Promise<{ srp_id: number | string, current_algo: passwordKdfAlgoUnknown | passwordKdfAlgoSHA256SHA256PBKDF2HMACSHA512iter100000SHA256ModPow, srp_B: bytes }>;

    setDefaultDc(dcId: number): Promise<string>;

    updates: {
      on(updateName: EventType, handler: EventHandler): void;
      off(updateName: EventType): void;
      removeAllListeners(): void;
    };

    crypto: {
      getSRPParams: typeof getSRPParams;
    };
  }

  export type bytes = Uint8Array;
  export type long = number | string;

  export type auth_Authorization = auth_authorization | auth_authorizationSignUpRequired;
  export interface auth_authorization {
    _: 'auth.authorization';
    setup_password_required?: boolean;
    otherwise_relogin_days?: number;
    tmp_sessions?: number;
    user?: User;
  }
  export interface auth_authorizationSignUpRequired {
    _: 'auth.authorizationSignUpRequired';
    terms_of_service: help_TermsOfService;
  }

  export type help_TermsOfService = help_termsOfService;
  export interface help_termsOfService {
    _: 'help.termsOfService';
    /** TODO: https://core.telegram.org/constructor/help.termsOfService */
    [key: string]: any;
  }

  export type User = userEmpty | user;
  export interface userEmpty {
    _: 'userEmpty';
    id: long | '0';
  }
  export interface user {
    _: 'user';
    /** TODO: https://core.telegram.org/constructor/user */
    [key: string]: any;
  }

  export type account_Password = passwordKdfAlgoUnknown | passwordKdfAlgoSHA256SHA256PBKDF2HMACSHA512iter100000SHA256ModPow;
  export interface passwordKdfAlgoUnknown {
    _: 'passwordKdfAlgoUnknown';
  }
  export interface passwordKdfAlgoSHA256SHA256PBKDF2HMACSHA512iter100000SHA256ModPow {
    _: 'passwordKdfAlgoSHA256SHA256PBKDF2HMACSHA512iter100000SHA256ModPow';
    salt1: bytes;
    salt2: bytes;
    g: number;
    p: bytes;
  }

  export class MyAsyncLocalStorage {
    setItem(key: string, value: string): Promise<void>;
    getItem(key: string): Promise<string|null>;
  }

  export type EventType = 'updatesTooLong'
    | 'updateShortMessage'
    | 'updateShortChatMessage'
    | 'updateShort'
    | 'updatesCombined'
    | 'updates'
    | 'updateShortSentMessage';
  export type EventHandler = (eventData: { [key: string]: any }) => any;

  export function getSRPParams(params: {
    g: number,
    p: Uint8Array,
    salt1: Uint8Array,
    salt2: Uint8Array,
    gB: Uint8Array,
    password: string,
  }): Promise<{
    A: Uint8Array,
    M1: Uint8Array;
  }>;

  export interface subtype { [key: string]: any; }
  export type Peer = subtype;
  export type MessageFwdHeader = subtype;
  export type MessageReplyHeader = subtype;
  export type MessageMedia = subtype;
  export type ReplyMarkup = subtype;
  export type MessageEntity = subtype;
  export type MessageReplies = subtype;
  export type MessageReactions = subtype;
  export type RestrictionReason = subtype;

  export interface Message {
    _: 'message';
    /** Is this an outgoing message */
    out: boolean;
    /** Whether we were mentioned in this message */
    mentioned: boolean;
    /** Whether there are unread media attachments in this message */
    media_unread: boolean;
    /** Whether this is a silent message (no notification triggered) */
    silent: boolean;
    /** Whether this is a channel post */
    post: boolean;
    /** Whether this is a scheduled message */
    from_scheduled: boolean;
    /** This is a legacy message: it has to be refetched with the new layer */
    legacy: boolean;
    /** Whether the message should be shown as not modified to the user, even if an edit date is present */
    edit_hide: boolean;
    /** Whether this message is pinned */
    pinned: boolean;
    /** Whether this message is protected and thus cannot be forwarded */
    noforwards: boolean;
    /** ID of the message */
    id: number;
    /** ID of the sender of the message */
    from_id: Peer;
    /** Peer ID, the chat where this message was sent */
    peer_id: Peer;
    /** Info about forwarded messages */
    fwd_from: MessageFwdHeader;
    /** ID of the inline bot that generated the message */
    via_bot_id: string;
    /** Reply information */
    reply_to: MessageReplyHeader;
    /** Date of the message */
    date: number;
    /** The message */
    message: string;
    /** Media attachment */
    media: MessageMedia;
    /** Reply markup (bot/inline keyboards) */
    reply_markup: ReplyMarkup;
    /** Message entities for styled text */
    entities: MessageEntity[];
    /** View count for channel posts */
    views: number;
    /** Forward counter */
    forwards: number;
    /** Info about post comments (for channels) or message replies (for groups) */
    replies: MessageReplies;
    /** Last edit date of this message */
    edit_date: number;
    /** Name of the author of this message for channel posts (with signatures enabled) */
    post_author: string;
    /** Multiple media messages sent using messages.sendMultiMedia with the same grouped ID indicate an album or media group */
    grouped_id: string;
    /** Reactions to this message */
    reactions: MessageReactions;
    /** Contains the reason why access to this message must be restricted. */
    restriction_reason: RestrictionReason[];
    /** Time To Live of the message, once message.date+message.ttl_period === time(), the message will be deleted on the server, and must be deleted locally as well. */
    ttl_period: number;
  }
}
