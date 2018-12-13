import "jest"

import { RowNotFoundError } from "../../dist"


describe("row-not-found-error", () => {
  it("instanceof", () => {
    const a = new RowNotFoundError()

    expect(a).toBeInstanceOf(RowNotFoundError)
    expect(a).toBeInstanceOf(Error)
  })
})
