

describe("search/Is_operator", function() {
    it("should return true for AND, OR and NOT and false otherwise", function() {

        expect(Is_operator("AND")).toEqual(true);
         expect(Is_operator("blah")).toEqual(false);
         expect(Is_operator("NOT")).toEqual(true);
         expect(Is_operator("OR")).toEqual(true);

    });

});


