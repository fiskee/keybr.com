import {
  Emulation,
  keyboardProps,
  Layout,
  loadKeyboard,
} from "@keybr/keyboard";
import { Settings } from "@keybr/settings";
import test from "ava";
import { emulateLayout } from "./emulation.ts";
import { tracingListener } from "./testing/fakes.ts";
import { type KeyEvent, type ModifierId } from "./types.ts";

test("translate without emulation", (t) => {
  // Arrange.

  const trace: string[] = [];
  const keyboard = loadKeyboard(Layout.EN_DVORAK);
  const target = tracingListener(trace);
  const listener = emulateLayout(
    new Settings().set(keyboardProps.emulation, Emulation.None),
    keyboard,
    target,
  );

  // Assert.

  t.is(listener, target);
});

test("translate with emulation", (t) => {
  // Arrange.

  const trace: string[] = [];
  const keyboard = loadKeyboard(Layout.EN_DVORAK);
  const target = tracingListener(trace);
  const listener = emulateLayout(
    new Settings().set(keyboardProps.emulation, Emulation.Forward),
    keyboard,
    target,
  );

  // Assert.

  t.not(listener, target);
});

test("translate a normal input", (t) => {
  // Arrange.

  const trace: string[] = [];
  const keyboard = loadKeyboard(Layout.EN_DVORAK);
  const target = tracingListener(trace);
  const listener = emulateLayout(
    new Settings().set(keyboardProps.emulation, Emulation.Forward),
    keyboard,
    target,
  );

  // Act.

  listener.onKeyDown(
    makeKeyEvent({
      timeStamp: 1,
      code: "ShiftLeft",
      key: "Shift",
    }),
  );
  listener.onKeyDown(
    makeKeyEvent({
      timeStamp: 2,
      code: "KeyS",
      key: "S",
      modifiers: ["Shift"],
    }),
  );
  listener.onTextInput({
    timeStamp: 2,
    inputType: "appendChar",
    codePoint: /* "S" */ 0x0053,
  });
  listener.onKeyUp(
    makeKeyEvent({
      timeStamp: 3,
      code: "KeyS",
      key: "S",
      modifiers: ["Shift"],
    }),
  );
  listener.onKeyUp(
    makeKeyEvent({
      timeStamp: 4,
      code: "ShiftLeft",
      key: "Shift",
    }),
  );

  // Assert.

  t.deepEqual(trace, [
    "keydown:ShiftLeft,Shift,1",
    "keydown:KeyS,O,2",
    "appendChar:O,2",
    "keyup:KeyS,O,3",
    "keyup:ShiftLeft,Shift,4",
  ]);
});

test("translate a control input", (t) => {
  // Arrange.

  const trace: string[] = [];
  const keyboard = loadKeyboard(Layout.EN_DVORAK);
  const target = tracingListener(trace);
  const listener = emulateLayout(
    new Settings().set(keyboardProps.emulation, Emulation.Forward),
    keyboard,
    target,
  );

  // Act.

  listener.onKeyDown(
    makeKeyEvent({
      timeStamp: 1,
      code: "ControlLeft",
      key: "Control",
    }),
  );
  listener.onKeyDown(
    makeKeyEvent({
      timeStamp: 2,
      code: "KeyS",
      key: "s",
      modifiers: ["Control"],
    }),
  );
  listener.onKeyUp(
    makeKeyEvent({
      timeStamp: 3,
      code: "KeyS",
      key: "s",
      modifiers: ["Control"],
    }),
  );
  listener.onKeyUp(
    makeKeyEvent({
      timeStamp: 4,
      code: "ControlLeft",
      key: "Control",
    }),
  );

  // Assert.

  t.deepEqual(trace, [
    "keydown:ControlLeft,Control,1",
    "keydown:KeyS,o,2",
    "keyup:KeyS,o,3",
    "keyup:ControlLeft,Control,4",
  ]);
});

test("translate a clear char input", (t) => {
  // Arrange.

  const trace: string[] = [];
  const keyboard = loadKeyboard(Layout.EN_DVORAK);
  const target = tracingListener(trace);
  const listener = emulateLayout(
    new Settings().set(keyboardProps.emulation, Emulation.Forward),
    keyboard,
    target,
  );

  // Act.

  listener.onKeyDown(
    makeKeyEvent({
      timeStamp: 1,
      code: "Backspace",
      key: "Backspace",
    }),
  );
  listener.onTextInput({
    timeStamp: 1,
    inputType: "clearChar",
    codePoint: 0x0000,
  });
  listener.onKeyUp(
    makeKeyEvent({
      timeStamp: 2,
      code: "Backspace",
      key: "Backspace",
    }),
  );

  // Assert.

  t.deepEqual(trace, [
    "keydown:Backspace,Backspace,1",
    "clearChar:\u0000,1",
    "keyup:Backspace,Backspace,2",
  ]);
});

test("translate a clear word input", (t) => {
  // Arrange.

  const trace: string[] = [];
  const keyboard = loadKeyboard(Layout.EN_DVORAK);
  const target = tracingListener(trace);
  const listener = emulateLayout(
    new Settings().set(keyboardProps.emulation, Emulation.Forward),
    keyboard,
    target,
  );

  // Act.

  listener.onKeyDown(
    makeKeyEvent({
      timeStamp: 1,
      code: "ControlLeft",
      key: "Control",
    }),
  );
  listener.onKeyDown(
    makeKeyEvent({
      timeStamp: 2,
      code: "Backspace",
      key: "Backspace",
      modifiers: ["Control"],
    }),
  );
  listener.onTextInput({
    timeStamp: 2,
    inputType: "clearWord",
    codePoint: 0x0000,
  });
  listener.onKeyUp(
    makeKeyEvent({
      timeStamp: 3,
      code: "Backspace",
      key: "Backspace",
      modifiers: ["Control"],
    }),
  );
  listener.onKeyUp(
    makeKeyEvent({
      timeStamp: 4,
      code: "ControlLeft",
      key: "Control",
    }),
  );

  // Assert.

  t.deepEqual(trace, [
    "keydown:ControlLeft,Control,1",
    "keydown:Backspace,Backspace,2",
    "clearWord:\u0000,2",
    "keyup:Backspace,Backspace,3",
    "keyup:ControlLeft,Control,4",
  ]);
});

test("translate the whitespace keys", (t) => {
  // Arrange.

  const trace: string[] = [];
  const keyboard = loadKeyboard(Layout.EN_DVORAK);
  const target = tracingListener(trace);
  const listener = emulateLayout(
    new Settings().set(keyboardProps.emulation, Emulation.Forward),
    keyboard,
    target,
  );

  // Act.

  listener.onKeyDown(
    makeKeyEvent({
      timeStamp: 1,
      code: "Space",
      key: "Space",
    }),
  );
  listener.onTextInput({
    timeStamp: 1,
    inputType: "appendChar",
    codePoint: 0x0020,
  });
  listener.onKeyUp(
    makeKeyEvent({
      timeStamp: 2,
      code: "Space",
      key: "Space",
    }),
  );
  listener.onKeyDown(
    makeKeyEvent({
      timeStamp: 3,
      code: "NumpadEnter",
      key: "Enter",
    }),
  );
  listener.onTextInput({
    timeStamp: 3,
    inputType: "appendLineBreak",
    codePoint: 0x0000,
  });
  listener.onKeyUp(
    makeKeyEvent({
      timeStamp: 4,
      code: "NumpadEnter",
      key: "Enter",
    }),
  );

  // Assert.

  t.deepEqual(trace, [
    "keydown:Space, ,1",
    "appendChar: ,1",
    "keyup:Space, ,2",
    "keydown:NumpadEnter,Enter,3",
    "appendLineBreak:\u0000,3",
    "keyup:NumpadEnter,Enter,4",
  ]);
});

test("fix key locations", (t) => {
  // Arrange.

  const trace: string[] = [];
  const keyboard = loadKeyboard(Layout.EN_DVORAK);
  const target = tracingListener(trace);
  const listener = emulateLayout(
    new Settings().set(keyboardProps.emulation, Emulation.Reverse),
    keyboard,
    target,
  );

  // Act.

  listener.onKeyDown(
    makeKeyEvent({
      timeStamp: 1,
      code: "ShiftLeft",
      key: "Shift",
    }),
  );
  listener.onKeyDown(
    makeKeyEvent({
      timeStamp: 2,
      code: "KeyO",
      key: "O",
      modifiers: ["Shift"],
    }),
  );
  listener.onTextInput({
    timeStamp: 2,
    inputType: "appendChar",
    codePoint: /* "O" */ 0x004f,
  });
  listener.onKeyUp(
    makeKeyEvent({
      timeStamp: 3,
      code: "KeyO",
      key: "O",
      modifiers: ["Shift"],
    }),
  );
  listener.onKeyUp(
    makeKeyEvent({
      timeStamp: 4,
      code: "ShiftLeft",
      key: "Shift",
    }),
  );

  // Assert.

  t.deepEqual(trace, [
    "keydown:ShiftLeft,Shift,1",
    "keydown:KeyS,O,2",
    "appendChar:O,2",
    "keyup:KeyS,O,3",
    "keyup:ShiftLeft,Shift,4",
  ]);
});

function makeKeyEvent({
  timeStamp,
  code,
  key,
  modifiers = [],
}: {
  timeStamp: number;
  code: string;
  key: string;
  repeat?: boolean;
  modifiers?: readonly ModifierId[];
}): KeyEvent {
  return {
    timeStamp,
    code,
    key,
    modifiers,
  };
}
