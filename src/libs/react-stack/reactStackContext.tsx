import { createContext, useCallback, useEffect } from "react";
import { StackInterface, StackPosition, StacksInterface, UpdateStackInterface } from "./types/Stack";
import { useRefSubscription } from "../react-subscriber/useRefSubscription";
import { RefSubscriptionInterface } from "../react-subscriber/types/RefSubscription";
import { Subscribe } from "../react-subscriber";
import { v4 as uuidv4 } from "uuid";
interface reactStackContextProps {
  children: React.ReactNode;
}

export type panelEvent = "open" | "close";

type IReactStackContext = {
  stacks: [];
  stackStore: RefSubscriptionInterface<StacksInterface>;
  history: RefSubscriptionInterface<string[]>;
  stackMethods: {
    closeAll: () => void;
    register: (stack: RefSubscriptionInterface<StackInterface>) => void;
    get: (name: string) => RefSubscriptionInterface<StackInterface> | RefSubscriptionInterface<StacksInterface> | null;
    update: (name: string, payload: UpdateStackInterface, event: panelEvent) => void;
  };
};

export const ReactStackContext = createContext<IReactStackContext>({
  stacks: [],
  stackStore: {} as RefSubscriptionInterface<StacksInterface>,
  history: {} as RefSubscriptionInterface<string[]>,
  stackMethods: {
    closeAll: () => null,
    register: () => null,
    get: () => null,
    update: () => null,
  },
});

export default function ReactStackprovider({ children }: reactStackContextProps) {
  const [stacks, setStacks] = useRefSubscription<StacksInterface>({});
  const [history, setHistory] = useRefSubscription<string[]>([]);
  const [history2, setHistory2] = useRefSubscription<{ name: string; stackId: string }[]>([]);

  const registerStack = useCallback(
    (stack: RefSubscriptionInterface<StackInterface>) => {
      if (!stacks.state[stack.state.name]) {
        setStacks(prev => ({
          ...prev,
          [stack.state.name]: stack,
        }));
      }
    },
    [stacks]
  );

  const registerCopyStack = useCallback(
    (name: string, stackId: string) => {
      if (stacks.state[name]) {
        const firstStack = Object.keys(stacks.state[name].state.stacks)[0];
        stacks.state[name].setValue(prev => ({
          ...prev,
          stacks: {
            ...prev.stacks,
            [stackId]: { ...stacks.state[name].state.stacks[firstStack] },
          },
        }));
      }
    },
    [stacks]
  );

  const updatePosition = useCallback(() => {
    const frontPanel = history2.state.at(-1);
    const backPanel = history2.state.at(-2);
    history2.state.forEach(panel => {
      let position: StackPosition = "hidden";
      if (panel.stackId === frontPanel?.stackId) {
        position = "front";
      } else if (panel.stackId === backPanel?.stackId) {
        position = "back";
      }

      if (stacks.state[panel.name]?.state.stacks[panel.stackId]?.state?.position !== position) {
        stacks.state[panel.name]?.state.stacks[panel.stackId].setValue(prev => {
          return {
            ...prev,
            position,
          };
        });
      }
    });
  }, [stacks, history]);

  const updateHistory = useCallback(
    (name: string, payload: UpdateStackInterface) => {
      if (stacks.state[name]) {
        if (!payload.open) {
          setHistory(prev => {
            return prev.filter(item => item !== name);
          });
        } else {
          setHistory(prev => {
            return [...prev, name];
          });
        }
      }
    },
    [stacks, history]
  );

  const updateHistory2 = useCallback(
    (name: string, stackId: string, payload: UpdateStackInterface) => {
      if (stacks.state[name]?.state.stacks[stackId]) {
        if (!payload.open) {
          setHistory2(prev => {
            return prev.filter(item => item.stackId !== stackId && item.name !== name);
          });
        } else {
          setHistory2(prev => {
            return [...prev, { name, stackId }];
          });
        }
      }
    },
    [stacks, history]
  );

  const closeAll = useCallback(() => {
    history.state.forEach(panel => {
      stacks.state[panel].setValue(prev => {
        return {
          ...prev,
          position: "hidden",
          open: false,
        };
      });
    });
  }, [stacks]);

  const updateStack = useCallback(
    (name: string, payload: UpdateStackInterface, event: panelEvent, subStacks?: string) => {
      if (stacks.state[name]) {
        const currentStack = stacks.state[name];
        const stackId = subStacks || currentStack.state.defaultStack;
        const selectedStack = currentStack.state.stacks[stackId];
        if (selectedStack) {
          if (event === "close") {
            if (selectedStack.state.open === true) {
              if (history.state.at(-1) === name) {
                updateHistory2(name, stackId, payload);
                selectedStack.setValue(prev => {
                  return {
                    ...prev,
                    ...payload,
                    position: "hidden",
                  };
                });
              }
            }
          } else if (event === "open") {
            if (selectedStack.state.open === false) {
              updateHistory2(name, stackId, payload);
              selectedStack.setValue(prev => {
                return {
                  ...prev,
                  ...payload,
                  position: "front",
                };
              });
            } else {
              console.log("ouiiii", name);
              const stackId = uuidv4();
              registerCopyStack(name, stackId);
              updateHistory2(name, stackId, payload);
              // updateStack(_name, payload, "open");
            }
          }

          updatePosition();
        }
      }
    },
    [stacks]
  );

  const getStacks = useCallback(
    (name?: string) => {
      if (name) {
        return stacks.state[name] || null;
      }

      return stacks;
    },
    [stacks]
  );

  useEffect(() => {
    stacks.register();
  }, []);

  return (
    <ReactStackContext.Provider
      value={{
        stacks: [],
        stackStore: stacks,
        history,
        stackMethods: {
          register: registerStack,
          closeAll,
          get: getStacks,
          update: updateStack,
        },
      }}
    >
      {children}
      <Subscribe to={stacks}>{newValue => <>{console.log("Store", newValue)}</>}</Subscribe>
      <Subscribe to={history2}>{newValue => <>{console.log("History2", newValue)}</>}</Subscribe>
    </ReactStackContext.Provider>
  );
}
