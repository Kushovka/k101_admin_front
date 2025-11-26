import "@testing-library/jest-dom"; // матчеры типа toBeInTheDocument
import { TextEncoder, TextDecoder } from "util";

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
