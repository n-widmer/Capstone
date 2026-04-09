import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import MenuPage from "@/app/menu/page";
import ThingsToDoPage from "@/app/things-to-do/page";
import RegistryPage from "@/app/registry/page";

// Mock Next.js components
jest.mock("next/link", () => {
  return function MockLink({ children, href, ...props }) {
    return <a href={href} {...props}>{children}</a>;
  };
});

jest.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

describe("Menu Page", () => {
  it("renders all appetizers from Theo's catering", () => {
    render(<MenuPage />);
    expect(screen.getByText("Cheese & Crackers")).toBeInTheDocument();
    expect(screen.getByText("Fresh Fruit with Dip")).toBeInTheDocument();
    expect(screen.getByText("Sliced Meats & Crackers")).toBeInTheDocument();
  });

  it("renders buffet dinner items", () => {
    render(<MenuPage />);
    expect(screen.getByText("Marry Me Chicken")).toBeInTheDocument();
    expect(screen.getByText("Penne Pasta with Marinara & Meatballs")).toBeInTheDocument();
  });

  it("renders accompaniments", () => {
    render(<MenuPage />);
    expect(screen.getByText("Signature Mashed Potatoes")).toBeInTheDocument();
    expect(screen.getByText("Glazed Baby Carrots")).toBeInTheDocument();
    expect(screen.getByText("Caribbean Blend Veggies")).toBeInTheDocument();
    expect(screen.getByText(/Family Style Salad/)).toBeInTheDocument();
    expect(screen.getByText("Rolls & Butter")).toBeInTheDocument();
  });

  it("renders desserts", () => {
    render(<MenuPage />);
    expect(screen.getByText("Wedding Cake")).toBeInTheDocument();
    expect(screen.getByText("Cupcakes & Cookies")).toBeInTheDocument();
  });

  it("renders beverages", () => {
    render(<MenuPage />);
    expect(screen.getByText("Iced Tea")).toBeInTheDocument();
    expect(screen.getByText("Lemonade")).toBeInTheDocument();
    expect(screen.getByText(/Coffee & Decaf/)).toBeInTheDocument();
  });

  it("renders timeline cards", () => {
    render(<MenuPage />);
    expect(screen.getByText("3:30 PM")).toBeInTheDocument();
    expect(screen.getByText("Ceremony")).toBeInTheDocument();
    expect(screen.getByText("5:30 PM")).toBeInTheDocument();
    expect(screen.getByText("Dinner")).toBeInTheDocument();
  });

  it("shows Theo's Catering credit", () => {
    render(<MenuPage />);
    expect(screen.getByText(/Theo's Catering/)).toBeInTheDocument();
  });

  it("renders BYOB information", () => {
    render(<MenuPage />);
    expect(screen.getByText(/BYOB Welcome/)).toBeInTheDocument();
  });
});

describe("Things To Do Page", () => {
  it("renders 3 sections", () => {
    render(<ThingsToDoPage />);
    expect(screen.getByText("Outdoor Activities")).toBeInTheDocument();
    expect(screen.getByText("Restaurants & Dining")).toBeInTheDocument();
    expect(screen.getByText("Shopping & Entertainment")).toBeInTheDocument();
  });

  it("does NOT contain Historical Sites section", () => {
    render(<ThingsToDoPage />);
    expect(screen.queryByText("Historical Sites")).not.toBeInTheDocument();
  });

  it("renders outdoor activity items", () => {
    render(<ThingsToDoPage />);
    expect(screen.getByText("Zoar Wetland Arboretum")).toBeInTheDocument();
    expect(screen.getByText("Atwood Lake Park")).toBeInTheDocument();
  });

  it("renders restaurant items", () => {
    render(<ThingsToDoPage />);
    expect(screen.getByText("Uncle Primo's")).toBeInTheDocument();
    expect(screen.getByText("Park Street Pizza")).toBeInTheDocument();
  });

  it("renders venue address", () => {
    render(<ThingsToDoPage />);
    expect(screen.getByText(/3931 State Route 39/)).toBeInTheDocument();
  });
});

describe("Registry Page", () => {
  it("renders Amazon registry link with correct URL", () => {
    render(<RegistryPage />);
    const amazonLink = screen.getByText("Shop on Amazon").closest("a");
    expect(amazonLink).toHaveAttribute("href", "https://www.amazon.com/wedding/guest-view/33DL72QMR1KES");
    expect(amazonLink).toHaveAttribute("target", "_blank");
  });

  it("renders Walmart registry link with correct URL", () => {
    render(<RegistryPage />);
    const walmartLink = screen.getByText("Shop on Walmart").closest("a");
    expect(walmartLink).toHaveAttribute("href", "https://www.walmart.com/registry/WR/0afce135-2924-4b49-98a2-63d12cbb21c6");
    expect(walmartLink).toHaveAttribute("target", "_blank");
  });

  it("renders House Fund section", () => {
    render(<RegistryPage />);
    expect(screen.getByText("House Fund")).toBeInTheDocument();
  });

  it("renders thank you message", () => {
    render(<RegistryPage />);
    expect(screen.getByText(/Tori & Connor/)).toBeInTheDocument();
  });
});
