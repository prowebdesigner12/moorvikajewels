import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SizeGuide = () => {
    return (
        <div className="container py-12 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8">Size Guide</h1>

            <Tabs defaultValue="men" className="w-full">
                <TabsList className="mb-8">
                    <TabsTrigger value="men">Men's Clothing</TabsTrigger>
                    <TabsTrigger value="women">Women's Clothing</TabsTrigger>
                    <TabsTrigger value="shoes">Shoes</TabsTrigger>
                </TabsList>

                <TabsContent value="men">
                    <h2 className="text-xl font-semibold mb-4">Men's Shirts & Tops</h2>
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Size</TableHead>
                                    <TableHead>Chest (in)</TableHead>
                                    <TableHead>Waist (in)</TableHead>
                                    <TableHead>Neck (in)</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell className="font-medium">S</TableCell>
                                    <TableCell>34-36</TableCell>
                                    <TableCell>28-30</TableCell>
                                    <TableCell>14-14.5</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">M</TableCell>
                                    <TableCell>38-40</TableCell>
                                    <TableCell>32-34</TableCell>
                                    <TableCell>15-15.5</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">L</TableCell>
                                    <TableCell>42-44</TableCell>
                                    <TableCell>36-38</TableCell>
                                    <TableCell>16-16.5</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">XL</TableCell>
                                    <TableCell>46-48</TableCell>
                                    <TableCell>40-42</TableCell>
                                    <TableCell>17-17.5</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>

                <TabsContent value="women">
                    <h2 className="text-xl font-semibold mb-4">Women's Dresses & Tops</h2>
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Size</TableHead>
                                    <TableHead>Bust (in)</TableHead>
                                    <TableHead>Waist (in)</TableHead>
                                    <TableHead>Hips (in)</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell className="font-medium">XS (0-2)</TableCell>
                                    <TableCell>31-32</TableCell>
                                    <TableCell>24-25</TableCell>
                                    <TableCell>33-34</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">S (4-6)</TableCell>
                                    <TableCell>33-34</TableCell>
                                    <TableCell>26-27</TableCell>
                                    <TableCell>35-36</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">M (8-10)</TableCell>
                                    <TableCell>35-36</TableCell>
                                    <TableCell>28-29</TableCell>
                                    <TableCell>37-38</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">L (12-14)</TableCell>
                                    <TableCell>37-39</TableCell>
                                    <TableCell>30-32</TableCell>
                                    <TableCell>39-41</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>

                <TabsContent value="shoes">
                    <h2 className="text-xl font-semibold mb-4">Shoe Size Conversion</h2>
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>US Men's</TableHead>
                                    <TableHead>US Women's</TableHead>
                                    <TableHead>UK</TableHead>
                                    <TableHead>EU</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell>7</TableCell>
                                    <TableCell>8.5</TableCell>
                                    <TableCell>6</TableCell>
                                    <TableCell>40</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>8</TableCell>
                                    <TableCell>9.5</TableCell>
                                    <TableCell>7</TableCell>
                                    <TableCell>41</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>9</TableCell>
                                    <TableCell>10.5</TableCell>
                                    <TableCell>8</TableCell>
                                    <TableCell>42</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>10</TableCell>
                                    <TableCell>11.5</TableCell>
                                    <TableCell>9</TableCell>
                                    <TableCell>43</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default SizeGuide;
